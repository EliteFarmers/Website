import { PEST_FARMING_STATS } from '../constants/stats.js';
import { mergeCost, UpgradeAction, UpgradeCategory, type FortuneUpgrade } from '../constants/upgrades.js';
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
const MAX_CONFIGURATION_STEPS = 12;
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
	const sourceArmorSetId = getSharedHelianthusSetId(input.player);
	if (!sourceArmorSetId || !hasExactlyOneCompleteHelianthusSet(input.player)) return;

	const { player: basePlayer, armorSet, purchaseUpgrades } = addBaseHelianthusSet(input.player);
	const { player: configuredPlayer, configurationUpgrades: clonedConfigurationUpgrades } = cloneArmorSetConfiguration(
		basePlayer,
		sourceArmorSetId,
		armorSet.id
	);
	let working = configuredPlayer;
	let configurationUpgrades: FortuneUpgrade[] = [];
	const visitedStates = new Set([getSetStateKey(working, armorSet.id)]);
	let assignment = getBestAssignment(working, armorSet.id, input.options, input.priceBook);

	for (
		let step = 0;
		assignment.result.valuation.coinsPerHour <= input.before.valuation.coinsPerHour + RATE_EPSILON;
		step++
	) {
		if (step >= MAX_CONFIGURATION_STEPS || input.shouldCancel?.()) return;
		const candidates = getConfigurationUpgrades(working, armorSet.id);
		let best:
			| {
					player: PestFarmingPlayer;
					upgrade: FortuneUpgrade;
					assignment: AssignmentResult;
					stateKey: string;
			  }
			| undefined;

		for (const upgrade of candidates) {
			if (input.shouldCancel?.()) return;
			const candidatePlayer = working.clone();
			candidatePlayer.applyPhaseUpgrade(PestFarmingPhase.Farm, upgrade);
			const stateKey = getSetStateKey(candidatePlayer, armorSet.id);
			if (visitedStates.has(stateKey)) continue;
			const candidateAssignment = getBestAssignment(candidatePlayer, armorSet.id, input.options, input.priceBook);
			if (
				!best ||
				candidateAssignment.result.valuation.coinsPerHour >
					best.assignment.result.valuation.coinsPerHour + RATE_EPSILON ||
				(Math.abs(
					candidateAssignment.result.valuation.coinsPerHour - best.assignment.result.valuation.coinsPerHour
				) <= RATE_EPSILON &&
					getUpgradeKey(upgrade).localeCompare(getUpgradeKey(best.upgrade)) < 0)
			) {
				best = { player: candidatePlayer, upgrade, assignment: candidateAssignment, stateKey };
			}
			await input.yieldControl?.();
		}

		if (!best) return;
		visitedStates.add(best.stateKey);
		working = best.player;
		configurationUpgrades = appendConfigurationUpgrade(configurationUpgrades, best.upgrade);
		assignment = best.assignment;
	}

	if (assignment.phases.length === 0) return;
	configurationUpgrades = configurationUpgrades.reduce(
		(upgrades, upgrade) => appendConfigurationUpgrade(upgrades, upgrade),
		clonedConfigurationUpgrades
	);
	const minimized = await minimizeConfiguration({
		basePlayer,
		armorSetId: armorSet.id,
		upgrades: configurationUpgrades,
		options: input.options,
		priceBook: input.priceBook,
		baselineCoinsPerHour: input.before.valuation.coinsPerHour,
		shouldCancel: input.shouldCancel,
		yieldControl: input.yieldControl,
	});
	if (!minimized) return;
	configurationUpgrades = minimized.upgrades;
	assignment = minimized.assignment;
	const members = [...purchaseUpgrades, ...configurationUpgrades];
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
			warning: `Adds a separate set for ${phaseLabel}, starting from the current set's configuration and retaining the tested upgrades needed to improve full-cycle profit.`,
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

async function minimizeConfiguration(input: {
	basePlayer: PestFarmingPlayer;
	armorSetId: string;
	upgrades: FortuneUpgrade[];
	options: PestFarmingRateOptions;
	priceBook: PestRatePriceBook;
	baselineCoinsPerHour: number;
	shouldCancel?: () => boolean;
	yieldControl?: () => Promise<void>;
}): Promise<{ upgrades: FortuneUpgrade[]; assignment: AssignmentResult } | undefined> {
	let upgrades = [...input.upgrades];
	let assignment = applyConfiguration(input.basePlayer, input.armorSetId, upgrades, input.options, input.priceBook);
	let changed = true;

	while (changed) {
		changed = false;
		for (let index = 0; index < upgrades.length; index++) {
			if (input.shouldCancel?.()) return;
			const upgrade = upgrades[index]!;
			if (hasLaterPrerequisiteDependent(upgrade, upgrades.slice(index + 1))) continue;
			const candidateUpgrades = upgrades.filter((_, candidateIndex) => candidateIndex !== index);
			const candidate = applyConfiguration(
				input.basePlayer,
				input.armorSetId,
				candidateUpgrades,
				input.options,
				input.priceBook
			);
			await input.yieldControl?.();
			if (candidate.result.valuation.coinsPerHour <= input.baselineCoinsPerHour + RATE_EPSILON) continue;
			upgrades = candidateUpgrades;
			assignment = candidate;
			changed = true;
			break;
		}
	}

	return { upgrades, assignment };
}

function applyConfiguration(
	basePlayer: PestFarmingPlayer,
	armorSetId: string,
	upgrades: FortuneUpgrade[],
	options: PestFarmingRateOptions,
	priceBook: PestRatePriceBook
): AssignmentResult {
	const player = basePlayer.clone();
	for (const upgrade of upgrades) player.applyPhaseUpgrade(PestFarmingPhase.Farm, upgrade);
	return getBestAssignment(player, armorSetId, options, priceBook);
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
