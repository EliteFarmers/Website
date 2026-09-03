import { expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { Rarity } from '../constants/reforges.js';
import { FarmingArmor } from '../fortune/farmingarmor.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { GearSlot } from '../items/definitions.js';
import { PEST_FARMING_PHASES, PestFarmingPhase, PestFarmingPlayer } from '../player/pestfarmingplayer.js';
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

function createPlayer(modifier?: string, enchantments?: Record<string, number>): PestFarmingPlayer {
	const armor = HELIANTHUS.map(([slot, skyblockId]) => {
		const piece = FarmingArmor.fakeItem(FARMING_ARMOR_INFO[skyblockId]!)!;
		piece.item.uuid = `owned:${slot.toLowerCase()}`;
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

test('keeps the bundled configuration scoped to the purchased physical set', async () => {
	const player = createPlayer('mossy');
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

test('finds a second-set recommendation when cloning the shared configuration exceeds the search cap', async () => {
	const player = createPlayer('mossy', { pesterminator: 6 });
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
