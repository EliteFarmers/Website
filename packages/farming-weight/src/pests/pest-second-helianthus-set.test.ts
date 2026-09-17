import { expect, test, vi } from 'vitest';
import { Crop } from '../constants/crops.js';
import { Rarity, REFORGES } from '../constants/reforges.js';
import { PEST_FARMING_STATS } from '../constants/stats.js';
import type { UpgradeCost } from '../constants/upgrades.js';
import { GemRarity } from '../fortune/item.js';
import { FarmingArmor } from '../fortune/farmingarmor.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { GearSlot } from '../items/definitions.js';
import { PEST_FARMING_PHASES, PestFarmingPhase, PestFarmingPlayer } from '../player/pestfarmingplayer.js';
import { getUpgradeableReforges } from '../upgrades/upgrades.js';
import { DEFAULT_PEST_CYCLE_SETTINGS, PestFarmingRateCalculator } from './pest-farming-rate-calculator.js';
import { PEST_DROP_DEFINITIONS } from './pest-drops.js';
import { findSecondHelianthusSetRecommendation } from './pest-second-helianthus-set.js';

const HELIANTHUS = [
	[GearSlot.Helmet, 'HELIANTHUS_HELMET'],
	[GearSlot.Chestplate, 'HELIANTHUS_CHESTPLATE'],
	[GearSlot.Leggings, 'HELIANTHUS_LEGGINGS'],
	[GearSlot.Boots, 'HELIANTHUS_BOOTS'],
] as const;

const priceBook = {
	version: 'second-set-test',
	missingItemMode: 'zero' as const,
	items: {
		[Crop.Wheat]: { coins: 6, source: 'npc' as const },
		...Object.fromEntries(
			Object.values(PEST_DROP_DEFINITIONS)
				.flatMap((definition) => [
					...definition.guaranteedDrops,
					...(definition.rareDrops ?? []),
					...(definition.feastRareDrop ? [definition.feastRareDrop] : []),
				])
				.map((drop) => [drop.itemId, { coins: 1_000, source: 'manual' as const }])
		),
	},
};

function createPlayer(
	modifier?: string,
	enchantments?: Record<string, number>,
	gems?: (slot: GearSlot) => Record<string, string | null>
): PestFarmingPlayer {
	const armor = HELIANTHUS.map(([slot, skyblockId]) => {
		const piece = FarmingArmor.fakeItem(FARMING_ARMOR_INFO[skyblockId]!)!;
		piece.item.uuid = `owned:${slot.toLowerCase()}`;
		piece.item.gems = gems?.(slot);
		piece.item.enchantments = enchantments ? { ...enchantments } : undefined;
		piece.item.attributes = {
			...piece.item.attributes,
			rarity: Rarity.Legendary,
			...(modifier ? { modifier } : {}),
		};
		return piece.item;
	});
	const pieces = Object.fromEntries(HELIANTHUS.map(([slot]) => [slot, `owned:${slot.toLowerCase()}`]));
	return new PestFarmingPlayer({
		armor,
		armorSets: [{ id: 'owned', name: 'Owned Helianthus', pieces }],
		equipmentSets: [],
		loadoutPresets: [{ id: 'owned', name: 'Owned', armorSetId: 'owned' }],
		phasePresetIds: Object.fromEntries(PEST_FARMING_PHASES.map((phase) => [phase, 'owned'])) as Record<
			PestFarmingPhase,
			string
		>,
	});
}

test('builds one atomic second-set purchase with the configuration needed to improve the cycle', async () => {
	const player = createPlayer();
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
	const recommendation = await findSecondHelianthusSetRecommendation({ player, options, priceBook, before });

	expect(recommendation).toBeDefined();
	expect(recommendation?.upgrade.group?.atomic).toBe(true);
	expect(recommendation?.upgrade.group?.warning).toMatch(/^For .+, with required upgrades\.$/);
	expect(recommendation?.upgrade.groupedUpgrades?.slice(0, 4).map((upgrade) => upgrade.purchase)).toStrictEqual(
		HELIANTHUS.map(([, skyblockId]) => skyblockId)
	);
	expect(recommendation?.upgrade.groupedUpgrades?.length).toBeGreaterThan(4);
	expect(recommendation?.impact.valuationDelta.coinsPerHour).toBeGreaterThan(0);
	expect(recommendation?.phases.length).toBeGreaterThan(0);
	expect(recommendation?.player.getArmorSetModel(recommendation.armorSet.id)?.slots[GearSlot.Boots]?.rarity).toBe(
		Rarity.Legendary
	);
	for (const [, skyblockId] of HELIANTHUS) {
		expect(recommendation?.upgrade.cost?.items?.[skyblockId]).toBe(1);
	}
});

test('does not recommend buying a third complete Helianthus set', async () => {
	const player = createPlayer();
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
	const first = await findSecondHelianthusSetRecommendation({ player, options, priceBook, before });

	expect(first).toBeDefined();
	const after = first!.impact.after;
	await expect(
		findSecondHelianthusSetRecommendation({ player: first!.player, options, priceBook, before: after })
	).resolves.toBeUndefined();
});

test('a profitable full reforge skips the individual-upgrade search', async () => {
	const player = createPlayer();
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
	const calculate = vi.spyOn(PestFarmingRateCalculator.prototype, 'calculate');
	try {
		const recommendation = await findSecondHelianthusSetRecommendation({ player, options, priceBook, before });
		expect(recommendation?.impact.valuationDelta.coinsPerHour).toBeGreaterThan(0);
		expect(recommendation?.upgrade.groupedUpgrades).toHaveLength(8);
		// Three complete reforges across seven phase assignments, with no redundant search or minimization.
		expect(calculate).toHaveBeenCalledTimes(21);
	} finally {
		calculate.mockRestore();
	}
});

test('cancels the full-set search without changing the source player', async () => {
	const player = createPlayer('squeaky');
	const original = player.getOptionsSnapshot();
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
	let cancelled = false;
	const recommendation = await findSecondHelianthusSetRecommendation({
		player,
		options,
		priceBook,
		before,
		shouldCancel: () => cancelled,
		yieldControl: async () => {
			cancelled = true;
		},
	});
	expect(recommendation).toBeUndefined();
	expect(player.getOptionsSnapshot()).toEqual(original);
});

test('keeps the bundled configuration scoped to the purchased physical set', async () => {
	const player = createPlayer('squeaky');
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
	const recommendation = await findSecondHelianthusSetRecommendation({ player, options, priceBook, before });

	expect(recommendation).toBeDefined();
	const configuration = recommendation!.upgrade.groupedUpgrades!.slice(4);
	expect(configuration.length).toBeGreaterThan(0);
	expect(configuration.every((upgrade) => upgrade.meta?.itemUuid?.startsWith(recommendation!.armorSet.id))).toBe(
		true
	);
	const reforgeTargets = configuration
		.filter((upgrade) => upgrade.meta?.type === 'reforge')
		.map((upgrade) => upgrade.meta?.itemUuid);
	expect(new Set(reforgeTargets).size).toBe(reforgeTargets.length);
	expect(recommendation?.impact.valuationDelta.coinsPerHour).toBeGreaterThan(0);
});

test('clones a fully enchanted set without adding unrelated upgrades', async () => {
	const player = createPlayer('squeaky', { pesterminator: 6 });
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
	const recommendation = await findSecondHelianthusSetRecommendation({ player, options, priceBook, before });

	expect(recommendation).toBeDefined();
	const configuration = recommendation!.upgrade.groupedUpgrades!.slice(4);
	expect(configuration.some((upgrade) => upgrade.title.startsWith('Pesterminator '))).toBe(true);
	expect(configuration.every((upgrade) => upgrade.meta?.itemUuid?.startsWith(recommendation!.armorSet.id))).toBe(
		true
	);
	expect(recommendation!.impact.valuationDelta.coinsPerHour).toBeGreaterThan(0);
});

test('does not call a first Helianthus set a second set', async () => {
	const player = new PestFarmingPlayer({
		armor: [FarmingArmor.fakeItem(FARMING_ARMOR_INFO.FERMENTO_HELMET!)!.item],
	});
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();

	await expect(
		findSecondHelianthusSetRecommendation({ player, options, priceBook, before })
	).resolves.toBeUndefined();
});

function purchaseCost(cost: UpgradeCost, guidePrice = 1): number {
	return (
		(cost.coins ?? 0) +
		Object.entries(cost.items ?? {}).reduce(
			(total, [id, count]) =>
				total +
				count * (id.startsWith('HELIANTHUS_') ? 100_000_000 : id === 'PESTHUNTING_GUIDE' ? guidePrice : 1),
			0
		) +
		(cost.applyCost ? purchaseCost(cost.applyCost, guidePrice) : 0)
	);
}

test.each(['unknown prices', 'cheap upgrades', 'equal payoff'])(
	'keeps the configured second set when trimming does not improve payoff: %s',
	async (scenario) => {
		const player = createPlayer('squeaky', { pesterminator: 6 });
		const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
		const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
		const recommendation = await findSecondHelianthusSetRecommendation({
			player,
			options,
			priceBook,
			before,
			getCost:
				scenario === 'unknown prices' ? () => undefined : scenario === 'equal payoff' ? () => 0 : purchaseCost,
		});
		expect(recommendation).toBeDefined();
		for (const [slot] of HELIANTHUS) {
			expect(
				recommendation!.player.getArmorSetModel(recommendation!.armorSet.id)!.slots[slot]!.item.enchantments
					?.pesterminator
			).toBe(6);
		}
	}
);

test('removes expensive upgrades only when the entire purchased set pays off faster', async () => {
	const player = createPlayer(undefined, { pesterminator: 6 });
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
	const original = await findSecondHelianthusSetRecommendation({ player, options, priceBook, before });
	const getCost = (cost: UpgradeCost) => purchaseCost(cost, 1_000_000_000);
	const trimmed = await findSecondHelianthusSetRecommendation({ player, options, priceBook, before, getCost });
	expect(original).toBeDefined();
	expect(trimmed).toBeDefined();
	expect(trimmed!.upgrade.cost?.items?.PESTHUNTING_GUIDE ?? 0).toBeLessThan(
		original!.upgrade.cost!.items!.PESTHUNTING_GUIDE!
	);
	expect(getCost(trimmed!.upgrade.cost!) / trimmed!.impact.valuationDelta.coinsPerHour).toBeLessThan(
		getCost(original!.upgrade.cost!) / original!.impact.valuationDelta.coinsPerHour
	);
	expect(trimmed!.upgrade.groupedUpgrades!.filter((upgrade) => upgrade.meta?.type === 'reforge')).toHaveLength(4);
});

test('does not add unrelated upgrades just to make an unprofitable clone profitable', async () => {
	const player = createPlayer('mossy');
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
	expect(await findSecondHelianthusSetRecommendation({ player, options, priceBook, before })).toBeUndefined();
});

test('charges slot unlocks and final gems, without discarded intermediate gems', async () => {
	const player = createPlayer('squeaky', { pesterminator: 6 }, (slot) => ({
		PERIDOT_0: slot === GearSlot.Boots ? GemRarity.Fine : GemRarity.Flawless,
		PERIDOT_1: slot === GearSlot.Boots ? GemRarity.Fine : GemRarity.Flawless,
	}));
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
	const recommendation = await findSecondHelianthusSetRecommendation({ player, options, priceBook, before });
	expect(recommendation).toBeDefined();
	expect(recommendation!.upgrade.cost!.items!.FINE_PERIDOT_GEM).toBe(242);
	expect(recommendation!.upgrade.cost!.items!.FLAWLESS_PERIDOT_GEM).toBe(6);
	const gemUpgrades = recommendation!.upgrade.groupedUpgrades!.filter((upgrade) => upgrade.meta?.type === 'gem');
	expect(gemUpgrades).toHaveLength(8);
	expect(gemUpgrades.reduce((total, upgrade) => total + (upgrade.cost?.coins ?? 0), 0)).toBe(600_000);
	for (const [slot] of HELIANTHUS) {
		const source = player.getArmorSetModel('owned')!.slots[slot]!.item;
		const purchased = recommendation!.player.getArmorSetModel(recommendation!.armorSet.id)!.slots[slot]!.item;
		expect(purchased.gems).toEqual(source.gems);
		expect(purchased.enchantments).toEqual(source.enchantments);
	}
});

test.each([1, 1_000_000_000])('trims gem tiers according to their price (%s), not their name', async (perfectPrice) => {
	const player = createPlayer('squeaky', undefined, () => ({
		PERIDOT_0: GemRarity.Perfect,
		PERIDOT_1: GemRarity.Perfect,
	}));
	const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
	const getCost = (cost: UpgradeCost) =>
		purchaseCost(cost) + (cost.items?.PERFECT_PERIDOT_GEM ?? 0) * (perfectPrice - 1);
	const original = await findSecondHelianthusSetRecommendation({ player, options, priceBook, before });
	const recommendation = await findSecondHelianthusSetRecommendation({ player, options, priceBook, before, getCost });
	expect(original).toBeDefined();
	expect(recommendation).toBeDefined();
	expect(original!.upgrade.cost!.items!.FINE_PERIDOT_GEM).toBe(240);
	expect(original!.upgrade.cost!.items!.FLAWLESS_PERIDOT_GEM).toBeUndefined();
	expect(original!.upgrade.cost!.items!.PERFECT_PERIDOT_GEM).toBe(8);
	expect(original!.requiredItemIds).toContain('FLAWLESS_PERIDOT_GEM');
	const target = perfectPrice === 1 ? GemRarity.Perfect : GemRarity.Flawless;
	for (const [slot] of HELIANTHUS) {
		expect(recommendation!.player.getArmorSetModel(recommendation!.armorSet.id)!.slots[slot]!.item.gems).toEqual({
			PERIDOT_0: target,
			PERIDOT_1: target,
		});
	}
	if (perfectPrice > 1) {
		expect(
			getCost(recommendation!.upgrade.cost!) / recommendation!.impact.valuationDelta.coinsPerHour
		).toBeLessThan(getCost(original!.upgrade.cost!) / original!.impact.valuationDelta.coinsPerHour);
		expect(recommendation!.upgrade.cost!.items!.FINE_PERIDOT_GEM).toBe(240);
		expect(recommendation!.upgrade.cost!.items!.FLAWLESS_PERIDOT_GEM).toBe(8);
		expect(recommendation!.upgrade.cost!.items!.PERFECT_PERIDOT_GEM).toBeUndefined();
	}
});

test.each([undefined, 'squeaky'])(
	'finishes all four pieces with the best full-set reforge when the owned set uses %s',
	async (modifier) => {
		const player = createPlayer(modifier);
		const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };
		const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
		const recommendation = await findSecondHelianthusSetRecommendation({ player, options, priceBook, before });
		expect(recommendation).toBeDefined();
		const { armorSet, player: recommendedPlayer, upgrade, impact } = recommendation!;
		const reforges = upgrade.groupedUpgrades!.filter((member) => member.meta?.type === 'reforge');
		expect(reforges).toHaveLength(4);
		expect(new Set(reforges.map((reforge) => reforge.meta?.itemUuid)).size).toBe(4);
		expect(new Set(reforges.map((reforge) => reforge.meta?.id)).size).toBe(1);
		const reforgeId = reforges[0]!.meta!.id!;
		expect(upgrade.cost?.items?.[REFORGES[reforgeId]!.stone!.id]).toBe(4);
		const model = recommendedPlayer.getArmorSetModel(armorSet.id)!;
		for (const [slot] of HELIANTHUS) {
			expect(model.slots[slot]!.item.attributes?.modifier).toBe(reforgeId);
			expect(player.getArmorSetModel('owned')!.slots[slot]!.item.attributes?.modifier).toBe(modifier);
		}

		const alternatives = HELIANTHUS.map(([slot]) => {
			const item = model.slots[slot]!.item;
			return getUpgradeableReforges(
				new FarmingArmor({ ...item, attributes: { ...item.attributes, modifier: null } }),
				PEST_FARMING_STATS
			);
		});
		for (const alternative of alternatives[0]!) {
			for (let mask = 1; mask < 1 << PEST_FARMING_PHASES.length; mask++) {
				const candidate = recommendedPlayer.clone();
				for (const upgrades of alternatives) {
					candidate.applyPhaseUpgrade(
						PestFarmingPhase.Farm,
						upgrades.find((entry) => entry.meta?.id === alternative.meta?.id)!
					);
				}
				PEST_FARMING_PHASES.forEach((phase, index) =>
					candidate.setPhaseArmorSet(phase, mask & (1 << index) ? armorSet.id : 'owned')
				);
				const result = new PestFarmingRateCalculator({ player: candidate, options, priceBook }).calculate();
				expect(result.valuation.coinsPerHour).toBeLessThanOrEqual(impact.after.valuation.coinsPerHour + 1e-7);
			}
		}
	}
);
