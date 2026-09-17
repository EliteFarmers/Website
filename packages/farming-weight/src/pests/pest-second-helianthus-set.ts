import { PEST_FARMING_STATS, type Stat } from '../constants/stats.js';
import {
	mergeCost,
	UpgradeAction,
	UpgradeCategory,
	type FortuneUpgrade,
	type UpgradeCost,
} from '../constants/upgrades.js';
import { FarmingArmor } from '../fortune/farmingarmor.js';
import { GemRarity, type EliteItemDto } from '../fortune/item.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { GearSlot } from '../items/definitions.js';
import {
	createPestFarmingPlayer,
	PEST_ARMOR_SLOTS,
	PEST_FARMING_PHASES,
	PestFarmingPhase,
	type PestArmorSetLoadout,
	type PestFarmingPlayer,
} from '../player/pestfarmingplayer.js';
import { getUpgradeableReforges } from '../upgrades/upgrades.js';
import { PestFarmingRateCalculator } from './pest-farming-rate-calculator.js';
import type {
	PestFarmingRateOptions,
	PestFarmingRateResult,
	PestFarmingUpgradeRateImpact,
	PestRatePriceBook,
} from './pest-rate-types.js';

const SECOND_SET_ID = 'local:second-helianthus';
const SECOND_SET_UPGRADE_ID = 'pest-second-helianthus-set';
const RATE_EPSILON = 1e-7;
const GEM_RANK: Record<GemRarity, number> = {
	[GemRarity.Rough]: 0,
	[GemRarity.Flawed]: 1,
	[GemRarity.Fine]: 2,
	[GemRarity.Flawless]: 3,
	[GemRarity.Perfect]: 4,
};
type UpgradeMetaType = NonNullable<NonNullable<FortuneUpgrade['meta']>['type']>;

const CLONE_UPGRADE_PRIORITY: Partial<Record<UpgradeMetaType, number>> = {
	reforge: 0,
	item: 1,
	enchant: 2,
	gem: 3,
};

const HELIANTHUS_PIECES = [
	[GearSlot.Helmet, 'HELIANTHUS_HELMET'],
	[GearSlot.Chestplate, 'HELIANTHUS_CHESTPLATE'],
	[GearSlot.Leggings, 'HELIANTHUS_LEGGINGS'],
	[GearSlot.Boots, 'HELIANTHUS_BOOTS'],
] as const;

export interface SecondHelianthusSetRecommendation {
	upgrade: FortuneUpgrade;
	/** Purchase and alternative-tier prices needed to evaluate trimming. */
	requiredItemIds: string[];
	impact: PestFarmingUpgradeRateImpact;
	player: PestFarmingPlayer;
	armorSet: PestArmorSetLoadout;
	phases: PestFarmingPhase[];
	primaryPhase: PestFarmingPhase;
}

interface RecommendationInput {
	player: PestFarmingPlayer;
	options: PestFarmingRateOptions;
	priceBook: PestRatePriceBook;
	before: PestFarmingRateResult;
	/** Purchase cost, including application fees; undefined when any required price is unavailable. */
	getCost?: (cost: UpgradeCost) => number | undefined;
	shouldCancel?: () => boolean;
	yieldControl?: () => Promise<void>;
}

interface AssignmentResult {
	player: PestFarmingPlayer;
	result: PestFarmingRateResult;
	phases: PestFarmingPhase[];
}

export async function findSecondHelianthusSetRecommendation(
	input: RecommendationInput
): Promise<SecondHelianthusSetRecommendation | undefined> {
	if (input.shouldCancel?.()) return;
	const sourceArmorSetId = getSharedHelianthusSetId(input.player);
	if (!sourceArmorSetId || !hasExactlyOneCompleteHelianthusSet(input.player)) return;

	const { player: basePlayer, armorSet, purchaseUpgrades } = addBaseHelianthusSet(input.player);
	const { player: configuredPlayer, configurationUpgrades: clonedConfigurationUpgrades } = cloneArmorSetConfiguration(
		basePlayer,
		sourceArmorSetId,
		armorSet.id
	);
	const initialReforge = await optimizeFullSetReforge({
		...input,
		player: configuredPlayer,
		armorSetId: armorSet.id,
	});
	if (!initialReforge) return;
	if (initialReforge.assignment.result.valuation.coinsPerHour <= input.before.valuation.coinsPerHour + RATE_EPSILON)
		return;
	const untrimmedReforge = initialReforge;
	let configurationUpgrades = [
		...clonedConfigurationUpgrades.filter((upgrade) => upgrade.meta?.type !== 'reforge'),
		...initialReforge.upgrades,
	];
	let assignment = initialReforge.assignment;
	const purchaseCost = mergeCost(...purchaseUpgrades.map((upgrade) => upgrade.cost ?? {}));
	const payoffHours = (upgrades: FortuneUpgrade[], result: AssignmentResult) =>
		getPayoffHours(input.getCost, purchaseCost, upgrades, result, input.before.valuation.coinsPerHour);
	const untrimmedUpgrades = configurationUpgrades;
	const untrimmedPayoff = payoffHours(untrimmedUpgrades, assignment);
	const minimized = await minimizeConfiguration({
		basePlayer,
		armorSetId: armorSet.id,
		upgrades: configurationUpgrades,
		options: input.options,
		priceBook: input.priceBook,
		baselineCoinsPerHour: input.before.valuation.coinsPerHour,
		assignment,
		payoffHours,
		shouldCancel: input.shouldCancel,
		yieldControl: input.yieldControl,
	});
	if (!minimized) return;
	// Recheck the best reforge only if enchantments, gems, or rarity changed.
	const reforged =
		minimized.upgrades.length === untrimmedUpgrades.length
			? untrimmedReforge
			: await optimizeFullSetReforge({
					...input,
					player: configurePlayer(basePlayer, minimized.upgrades),
					armorSetId: armorSet.id,
				});
	if (
		!reforged ||
		reforged.assignment.result.valuation.coinsPerHour <= input.before.valuation.coinsPerHour + RATE_EPSILON
	)
		return;
	configurationUpgrades = [
		...minimized.upgrades.filter((upgrade) => upgrade.meta?.type !== 'reforge'),
		...reforged.upgrades,
	];
	assignment = reforged.assignment;
	// A changed rarity can change the best reforge and its fees. Keep the original
	// configuration if that final reforge would undo the payoff improvement.
	if (minimized.upgrades.length < untrimmedUpgrades.length) {
		const finalPayoff = payoffHours(configurationUpgrades, assignment);
		if (finalPayoff === undefined || untrimmedPayoff === undefined || finalPayoff >= untrimmedPayoff) {
			configurationUpgrades = untrimmedUpgrades;
			assignment = untrimmedReforge.assignment;
		}
	}
	const members = [...purchaseUpgrades, ...getPurchaseConfiguration(configurationUpgrades)];
	const phaseNames = assignment.phases.map(titleCasePhase);
	const phaseLabel = formatNames(phaseNames);
	const upgrade: FortuneUpgrade = {
		title: 'Buy Second Helianthus Set',
		increase: 0,
		action: UpgradeAction.Purchase,
		category: UpgradeCategory.Item,
		purchase: 'HELIANTHUS_HELMET',
		wiki: 'https://w.elitesb.gg/Helianthus_Armor',
		cost: mergeCost(...members.map((member) => member.cost ?? {})),
		conflictKey: SECOND_SET_UPGRADE_ID,
		group: {
			id: SECOND_SET_UPGRADE_ID,
			label: 'Second Helianthus Set',
			strategy: 'available-pieces',
			kind: 'loadout',
			atomic: true,
			warning: `For ${phaseLabel}, with required upgrades.`,
			memberCount: members.length,
		},
		groupedUpgrades: members,
		meta: { type: 'upgrade_group', id: SECOND_SET_UPGRADE_ID },
	};
	const primaryPhase = assignment.phases[0]!;
	const calculator = new PestFarmingRateCalculator({
		player: input.player,
		options: input.options,
		priceBook: input.priceBook,
	});

	return {
		upgrade,
		requiredItemIds: [
			...new Set([
				...getCostItemIds([...purchaseUpgrades, ...untrimmedUpgrades]),
				...initialReforge.requiredItemIds,
			]),
		],
		impact: calculator.compareResults(input.before, assignment.result, primaryPhase, SECOND_SET_UPGRADE_ID),
		player: assignment.player,
		armorSet,
		phases: assignment.phases,
		primaryPhase,
	};
}

function getSharedHelianthusSetId(player: PestFarmingPlayer): string | undefined {
	const selectedSetIds = new Set(
		PEST_FARMING_PHASES.map((phase) => player.phaseLoadouts[phase].armorSetId).filter((id): id is string =>
			Boolean(id)
		)
	);
	if (selectedSetIds.size !== 1) return;
	const selectedSetId = selectedSetIds.values().next().value;
	if (!selectedSetId || !isCompleteHelianthusSet(player, selectedSetId)) return;
	return selectedSetId;
}

function hasExactlyOneCompleteHelianthusSet(player: PestFarmingPlayer): boolean {
	return player.armorSetLoadouts.filter((set) => isCompleteHelianthusSet(player, set.id)).length === 1;
}

function isCompleteHelianthusSet(player: PestFarmingPlayer, armorSetId: string): boolean {
	const model = player.getArmorSetModel(armorSetId);
	return HELIANTHUS_PIECES.every(([slot, skyblockId]) => model?.slots[slot]?.item.skyblockId === skyblockId);
}

function addBaseHelianthusSet(player: PestFarmingPlayer): {
	player: PestFarmingPlayer;
	armorSet: PestArmorSetLoadout;
	purchaseUpgrades: FortuneUpgrade[];
} {
	const source = player.clone();
	const setId = uniqueSetId(source);
	const pieces: Partial<Record<GearSlot, string>> = {};
	const items: EliteItemDto[] = [];
	const purchaseUpgrades: FortuneUpgrade[] = [];

	for (const [slot, skyblockId] of HELIANTHUS_PIECES) {
		const info = FARMING_ARMOR_INFO[skyblockId]!;
		const fake = FarmingArmor.fakeItem(info)!;
		const uuid = `${setId}:${slot.toLowerCase()}`;
		const item = structuredClone(fake.item);
		item.uuid = uuid;
		item.attributes = { ...item.attributes, rarity: info.baseRarity };
		const purchasedPiece = new FarmingArmor(item);
		pieces[slot] = uuid;
		items.push(item);
		purchaseUpgrades.push({
			title: info.name,
			increase: purchasedPiece.getFortune(),
			stats: purchasedPiece.getStats(),
			action: UpgradeAction.Purchase,
			category: UpgradeCategory.Item,
			purchase: skyblockId,
			wiki: info.wiki,
			cost: { items: { [skyblockId]: 1 } },
			onto: { slot, newSkyblockId: skyblockId },
			conflictKey: `${SECOND_SET_UPGRADE_ID}:purchase:${slot}`,
			meta: { type: 'buy_item', id: skyblockId },
		});
	}

	const armorSet: PestArmorSetLoadout = { id: setId, name: 'Second Helianthus Set', pieces };
	return {
		armorSet,
		purchaseUpgrades,
		player: createPestFarmingPlayer({
			...source.options,
			armor: [...source.getArmorInventoryItems(), ...items],
			armorSets: [...source.armorSetLoadouts, armorSet],
			loadoutPresets: source.loadoutPresets,
			phasePresetIds: source.phasePresetIds,
			phaseLoadouts: undefined,
		}),
	};
}

function cloneArmorSetConfiguration(
	player: PestFarmingPlayer,
	sourceArmorSetId: string,
	targetArmorSetId: string
): { player: PestFarmingPlayer; configurationUpgrades: FortuneUpgrade[] } {
	const sourceModel = player.getArmorSetModel(sourceArmorSetId);
	const targetModel = player.getArmorSetModel(targetArmorSetId);
	if (!sourceModel || !targetModel) return { player, configurationUpgrades: [] };

	const sourceItemsByTargetUuid = new Map<string, EliteItemDto>();
	for (const slot of PEST_ARMOR_SLOTS) {
		const sourceItem = sourceModel.slots[slot]?.item;
		const targetUuid = targetModel.slots[slot]?.item.uuid;
		if (sourceItem && targetUuid) sourceItemsByTargetUuid.set(targetUuid, sourceItem);
	}

	let working = player;
	let configurationUpgrades: FortuneUpgrade[] = [];
	const visitedStates = new Set([getSetStateKey(working, targetArmorSetId)]);

	while (true) {
		const next = getConfigurationUpgrades(working, targetArmorSetId)
			.filter((upgrade) => {
				const itemUuid = upgrade.meta?.itemUuid;
				const sourceItem = itemUuid ? sourceItemsByTargetUuid.get(itemUuid) : undefined;
				return sourceItem ? movesTowardItemConfiguration(upgrade, sourceItem) : false;
			})
			.sort(compareCloneUpgrades)[0];
		if (!next) break;

		const candidate = working.clone();
		candidate.applyPhaseUpgrade(PestFarmingPhase.Farm, next);
		const stateKey = getSetStateKey(candidate, targetArmorSetId);
		if (visitedStates.has(stateKey)) break;

		visitedStates.add(stateKey);
		working = candidate;
		configurationUpgrades = appendConfigurationUpgrade(configurationUpgrades, next);
	}

	return { player: working, configurationUpgrades };
}

function movesTowardItemConfiguration(upgrade: FortuneUpgrade, sourceItem: EliteItemDto): boolean {
	const meta = upgrade.meta;
	if (!meta) return false;

	switch (meta.type) {
		case 'reforge':
			return meta.id === sourceItem.attributes?.modifier?.toLowerCase();
		case 'enchant': {
			const key = meta.key;
			return key !== undefined && Number(meta.value) <= Number(sourceItem.enchantments?.[key] ?? 0);
		}
		case 'gem': {
			if (!meta.slot || typeof meta.value !== 'string') return false;
			const target = sourceItem.gems?.[meta.slot] as GemRarity | null | undefined;
			const candidateRank = GEM_RANK[meta.value as GemRarity];
			return (
				target !== null &&
				target !== undefined &&
				candidateRank !== undefined &&
				candidateRank <= GEM_RANK[target]
			);
		}
		case 'item':
			return (
				meta.id === 'rarity_upgrades' &&
				Number(meta.value) <= Number(sourceItem.attributes?.rarity_upgrades ?? 0)
			);
		default:
			return false;
	}
}

function compareCloneUpgrades(left: FortuneUpgrade, right: FortuneUpgrade): number {
	const priority = getCloneUpgradePriority(left) - getCloneUpgradePriority(right);
	return priority || getUpgradeKey(left).localeCompare(getUpgradeKey(right));
}

function getCloneUpgradePriority(upgrade: FortuneUpgrade): number {
	const type = upgrade.meta?.type;
	return type ? (CLONE_UPGRADE_PRIORITY[type] ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
}

function getConfigurationUpgrades(player: PestFarmingPlayer, armorSetId: string): FortuneUpgrade[] {
	const model = player.getArmorSetModel(armorSetId);
	if (!model) return [];
	const upgrades = PEST_ARMOR_SLOTS.flatMap(
		(slot) => model.slots[slot]?.getUpgrades({ stats: PEST_FARMING_STATS }) ?? []
	).filter(
		(upgrade) => upgrade.meta?.itemUuid && upgrade.meta.type !== 'upgrade_group' && upgrade.meta.type !== 'buy_item'
	);
	return [...new Map(upgrades.map((upgrade) => [getUpgradeKey(upgrade), upgrade])).values()].sort((a, b) =>
		getUpgradeKey(a).localeCompare(getUpgradeKey(b))
	);
}

function getBestAssignment(
	configuredPlayer: PestFarmingPlayer,
	armorSetId: string,
	options: PestFarmingRateOptions,
	priceBook: PestRatePriceBook
): AssignmentResult {
	let best: AssignmentResult | undefined;
	for (let mask = 1; mask < 1 << PEST_FARMING_PHASES.length; mask++) {
		const candidate = configuredPlayer.clone();
		const phases = PEST_FARMING_PHASES.filter((_, index) => (mask & (1 << index)) !== 0);
		for (const phase of phases) candidate.setPhaseArmorSet(phase, armorSetId);
		const result = new PestFarmingRateCalculator({ player: candidate, options, priceBook }).calculate();
		if (
			!best ||
			result.valuation.coinsPerHour > best.result.valuation.coinsPerHour + RATE_EPSILON ||
			(Math.abs(result.valuation.coinsPerHour - best.result.valuation.coinsPerHour) <= RATE_EPSILON &&
				phaseKey(phases).localeCompare(phaseKey(best.phases)) < 0)
		) {
			best = { player: candidate, result, phases };
		}
	}
	return best!;
}

async function optimizeFullSetReforge(input: RecommendationInput & { armorSetId: string }): Promise<
	| {
			upgrades: FortuneUpgrade[];
			assignment: AssignmentResult;
			player: PestFarmingPlayer;
			requiredItemIds: string[];
	  }
	| undefined
> {
	const model = input.player.getArmorSetModel(input.armorSetId);
	if (!model) return;
	const configurations = new Map<string, FortuneUpgrade[]>();
	for (const slot of PEST_ARMOR_SLOTS) {
		const piece = model.slots[slot];
		if (!piece) return;
		// Compare every available reforge, including the one already on the piece.
		const unreforged = new FarmingArmor({
			...piece.item,
			attributes: { ...piece.item.attributes, modifier: null },
		});
		for (const upgrade of getUpgradeableReforges(unreforged, PEST_FARMING_STATS)) {
			const id = upgrade.meta!.id!;
			const upgrades = configurations.get(id) ?? [];
			upgrades.push(upgrade);
			configurations.set(id, upgrades);
		}
	}

	let best: { upgrades: FortuneUpgrade[]; assignment: AssignmentResult; player: PestFarmingPlayer } | undefined;
	for (const [, upgrades] of [...configurations].sort(([left], [right]) => left.localeCompare(right))) {
		if (input.shouldCancel?.()) return;
		if (upgrades.length !== PEST_ARMOR_SLOTS.length) continue;
		const player = configurePlayer(input.player, upgrades);
		const assignment = getBestAssignment(player, input.armorSetId, input.options, input.priceBook);
		if (
			!best ||
			assignment.result.valuation.coinsPerHour > best.assignment.result.valuation.coinsPerHour + RATE_EPSILON
		) {
			best = { upgrades, assignment, player };
		}
		await input.yieldControl?.();
	}
	return input.shouldCancel?.() || !best
		? undefined
		: { ...best, requiredItemIds: getCostItemIds([...configurations.values()].flat()) };
}

function getCostItemIds(upgrades: FortuneUpgrade[]): string[] {
	return [
		...new Set(
			upgrades.flatMap((upgrade) => [
				...Object.keys(upgrade.cost?.items ?? {}),
				...Object.keys(upgrade.cost?.applyCost?.items ?? {}),
			])
		),
	];
}

async function minimizeConfiguration(input: {
	basePlayer: PestFarmingPlayer;
	armorSetId: string;
	upgrades: FortuneUpgrade[];
	options: PestFarmingRateOptions;
	priceBook: PestRatePriceBook;
	baselineCoinsPerHour: number;
	assignment: AssignmentResult;
	payoffHours: (upgrades: FortuneUpgrade[], assignment: AssignmentResult) => number | undefined;
	shouldCancel?: () => boolean;
	yieldControl?: () => Promise<void>;
}): Promise<{ upgrades: FortuneUpgrade[] } | undefined> {
	let upgrades = [...input.upgrades];
	let payoff = input.payoffHours(upgrades, input.assignment);
	// Missing purchase prices must not make expensive upgrades look free to remove.
	if (payoff === undefined) return { upgrades };
	while (true) {
		// Compare the same tier across pieces together, rather than stopping halfway
		// through a set. Grouping is based on upgrade metadata, not particular items.
		const groups = new Map<string, Set<FortuneUpgrade>>();
		for (let index = 0; index < upgrades.length; index++) {
			const upgrade = upgrades[index]!;
			const meta = upgrade.meta;
			if (!meta || meta.type === 'reforge') continue;
			if (hasLaterPrerequisiteDependent(upgrade, upgrades.slice(index + 1))) continue;
			const key = JSON.stringify([
				meta.type,
				meta.id,
				meta.key,
				meta.value,
				meta.type === 'gem' ? meta.slot?.split('_')[0] : undefined,
			]);
			const group = groups.get(key) ?? new Set<FortuneUpgrade>();
			group.add(upgrade);
			groups.set(key, group);
		}
		let best: { upgrades: FortuneUpgrade[]; payoff: number } | undefined;
		for (const group of groups.values()) {
			if (input.shouldCancel?.()) return;
			const candidateUpgrades = upgrades.filter((upgrade) => !group.has(upgrade));
			const candidate = applyConfiguration(
				input.basePlayer,
				input.armorSetId,
				candidateUpgrades,
				input.options,
				input.priceBook
			);
			await input.yieldControl?.();
			if (candidate.result.valuation.coinsPerHour <= input.baselineCoinsPerHour + RATE_EPSILON) continue;
			const candidatePayoff = input.payoffHours(candidateUpgrades, candidate);
			if (candidatePayoff === undefined || candidatePayoff >= (best?.payoff ?? payoff)) continue;
			best = { upgrades: candidateUpgrades, payoff: candidatePayoff };
		}
		if (!best) break;
		upgrades = best.upgrades;
		payoff = best.payoff;
	}

	return { upgrades };
}

function getPurchaseConfiguration(upgrades: FortuneUpgrade[]): FortuneUpgrade[] {
	const result: FortuneUpgrade[] = [];
	const gems = new Map<string, FortuneUpgrade[]>();
	for (const upgrade of upgrades) {
		if (upgrade.meta?.type !== 'gem') {
			result.push(upgrade);
			continue;
		}
		const key = JSON.stringify([upgrade.meta.itemUuid, upgrade.meta.slot]);
		const chain = gems.get(key) ?? [];
		chain.push(upgrade);
		gems.set(key, chain);
	}
	for (const chain of gems.values()) {
		const final = chain.at(-1)!;
		const cost = mergeCost(...chain.map((upgrade) => upgrade.cost ?? {}));
		// A new slot needs its unlock materials and only the final installed gem.
		// Earlier gem tiers were simulation steps, not purchase prerequisites.
		for (const intermediate of chain.slice(0, -1)) {
			const gemType = intermediate.meta!.slot!.split('_')[0];
			const itemId = `${intermediate.meta!.value}_${gemType}_GEM`;
			if (cost.items?.[itemId]) {
				cost.items[itemId]--;
				if (cost.items[itemId] === 0) delete cost.items[itemId];
			}
		}
		const stats: Partial<Record<Stat, number>> = {};
		for (const upgrade of chain) {
			for (const [stat, amount] of Object.entries(upgrade.stats ?? {}) as [Stat, number][]) {
				stats[stat] = (stats[stat] ?? 0) + amount;
			}
		}
		result.push({
			...final,
			cost,
			stats,
			increase: chain.reduce((total, upgrade) => total + upgrade.increase, 0),
			effects: chain.flatMap((upgrade) => upgrade.effects ?? []),
		});
	}
	return result;
}

function getPayoffHours(
	getCost: RecommendationInput['getCost'],
	purchaseCost: UpgradeCost,
	upgrades: FortuneUpgrade[],
	assignment: AssignmentResult,
	baselineCoinsPerHour: number
): number | undefined {
	const gain = assignment.result.valuation.coinsPerHour - baselineCoinsPerHour;
	if (gain <= RATE_EPSILON) return;
	const cost = getCost?.(
		mergeCost(purchaseCost, ...getPurchaseConfiguration(upgrades).map((upgrade) => upgrade.cost ?? {}))
	);
	if (cost === undefined || !Number.isFinite(cost) || cost < 0) return;
	return cost / gain;
}

function applyConfiguration(
	basePlayer: PestFarmingPlayer,
	armorSetId: string,
	upgrades: FortuneUpgrade[],
	options: PestFarmingRateOptions,
	priceBook: PestRatePriceBook
): AssignmentResult {
	return getBestAssignment(configurePlayer(basePlayer, upgrades), armorSetId, options, priceBook);
}

function configurePlayer(basePlayer: PestFarmingPlayer, upgrades: FortuneUpgrade[]): PestFarmingPlayer {
	const player = basePlayer.clone();
	for (const upgrade of upgrades) player.applyPhaseUpgrade(PestFarmingPhase.Farm, upgrade);
	return player;
}

function appendConfigurationUpgrade(upgrades: FortuneUpgrade[], upgrade: FortuneUpgrade): FortuneUpgrade[] {
	if (upgrade.meta?.type !== 'reforge') return [...upgrades, upgrade];
	return [
		...upgrades.filter(
			(candidate) => candidate.meta?.type !== 'reforge' || candidate.meta.itemUuid !== upgrade.meta?.itemUuid
		),
		upgrade,
	];
}

function hasLaterPrerequisiteDependent(upgrade: FortuneUpgrade, later: FortuneUpgrade[]): boolean {
	const meta = upgrade.meta;
	if (!meta?.itemUuid) return false;
	return later.some((candidate) => {
		const other = candidate.meta;
		if (!other || other.itemUuid !== meta.itemUuid || other.type !== meta.type) return false;
		if (meta.type === 'enchant') return other.key === meta.key;
		if (meta.type === 'gem') return other.slot === meta.slot;
		if (meta.type === 'item') return other.id === meta.id;
		return false;
	});
}

function getSetStateKey(player: PestFarmingPlayer, armorSetId: string): string {
	const model = player.getArmorSetModel(armorSetId);
	return JSON.stringify(
		PEST_ARMOR_SLOTS.map((slot) => {
			const item = model?.slots[slot]?.item;
			return [slot, item?.skyblockId, item?.attributes, item?.enchantments, item?.gems];
		})
	);
}

function getUpgradeKey(upgrade: FortuneUpgrade): string {
	return [
		upgrade.meta?.itemUuid ?? '',
		upgrade.meta?.type ?? '',
		upgrade.meta?.id ?? '',
		upgrade.meta?.key ?? '',
		upgrade.meta?.slot ?? '',
		upgrade.meta?.value ?? '',
	].join(':');
}

function uniqueSetId(player: PestFarmingPlayer): string {
	let id = SECOND_SET_ID;
	let suffix = 2;
	while (player.getArmorSetLoadout(id)) id = `${SECOND_SET_ID}:${suffix++}`;
	return id;
}

function phaseKey(phases: PestFarmingPhase[]): string {
	return phases.join(':');
}

function titleCasePhase(phase: PestFarmingPhase): string {
	return `${phase.charAt(0).toUpperCase()}${phase.slice(1)}`;
}

function formatNames(names: string[]): string {
	if (names.length <= 1) return names[0] ?? 'another phase';
	if (names.length === 2) return `${names[0]} and ${names[1]}`;
	return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`;
}
