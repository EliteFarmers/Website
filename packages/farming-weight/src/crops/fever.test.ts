import { describe, expect, test } from 'vitest';
import { Crop, CROP_INFO } from '../constants/crops.js';
import { FarmingMechanic } from '../constants/mechanics.js';
import { Rarity } from '../constants/reforges.js';
import { FarmingTool } from '../fortune/farmingtool.js';
import { FARMING_TOOLS } from '../items/tools.js';
import { FarmingPlayer } from '../player/player.js';
import { PestFarmingPlayer } from '../player/pestfarmingplayer.js';
import { DEFAULT_PEST_CYCLE_SETTINGS, PestFarmingRateCalculator } from '../pests/pest-farming-rate-calculator.js';
import { getCropFeverRateEffects, getCropFeverUptime } from './fever.js';

function playerWithFever(crop: Crop, level: number, enchantments: Record<string, number> = {}) {
	const tool = FarmingTool.fakeItem(FARMING_TOOLS[CROP_INFO[crop].startingTool]!)!;
	tool.item.uuid = 'fever-tool';
	tool.item.enchantments = { ultimate_crop_fever: level, ...enchantments };
	return new FarmingPlayer({
		tools: [tool.item],
		harvestFeast: { active: true, inSeasonCrops: [crop] },
	});
}

describe('Crop Fever averaging', () => {
	test.each([1, 2, 3, 4, 5])('level %i waits for the active minute to end before another trigger', (level) => {
		const expectedWaitingSeconds = 100_000 / level / 20;
		const uptime = getCropFeverUptime(level, Crop.Potato, 20);
		expect(uptime).toBeCloseTo(60 / (expectedWaitingSeconds + 60), 12);
		expect(uptime).toBeLessThan(60 / expectedWaitingSeconds);
	});

	test('level V gives 5.66% uptime at 20 breaks/sec and scales with speed', () => {
		expect(getCropFeverUptime(5, Crop.Wheat, 20)).toBeCloseTo(3 / 53, 12);
		expect(getCropFeverUptime(5, Crop.Wheat, 10)).toBeCloseTo(3 / 103, 12);
		expect(getCropFeverUptime(5, Crop.SugarCane, 20)).toBeCloseTo(3 / 28, 12);
		expect(getCropFeverUptime(5, Crop.Cactus, 20)).toBeCloseTo(3 / 28, 12);
	});

	test('missing enchant and zero speed produce no bonuses', () => {
		expect(getCropFeverRateEffects(0, Crop.Wheat, 20)).toEqual([]);
		expect(getCropFeverRateEffects(5, Crop.Wheat, 0)).toEqual([]);
		expect(getCropFeverRateEffects(5, Crop.Wheat, Number.NaN)).toEqual([]);
		expect(getCropFeverRateEffects(5, Crop.Seeds, 20)).toEqual([]);
	});
});

describe('Crop Fever rate impact', () => {
	test.each([
		[20, Rarity.Legendary, 200],
		[10, Rarity.Legendary, 150],
		[10, Rarity.Rare, 130],
	] as const)('Hypercharge level %i (%s) scales only the temporary fortune to %i', (level, rarity, activeFortune) => {
		const basePlayer = playerWithFever(Crop.Potato, 5);
		const player = new FarmingPlayer({
			...basePlayer.options,
			chips: { hypercharge: level },
			chipRarities: { hypercharge: rarity },
		});
		const plainFortune = playerWithFever(Crop.Potato, 0).getRates(Crop.Potato, 72_000).fortune;
		const base = basePlayer.getRates(Crop.Potato, 72_000);
		const rates = player.getRates(Crop.Potato, 72_000);
		expect(rates.fortune - plainFortune).toBeCloseTo((activeFortune * 3) / 53, 8);
		expect(rates.rngItems?.ENCHANTED_POTATO).toBe(base.rngItems?.ENCHANTED_POTATO);
		expect(rates.rngItems?.ENCHANTED_BAKED_POTATO).toBe(base.rngItems?.ENCHANTED_BAKED_POTATO);
		expect(rates.effectsBreakdown['Crop Fever']).toBe(base.effectsBreakdown['Crop Fever']);
		const upgrade = playerWithFever(Crop.Potato, 4)
			.getCropUpgrades(Crop.Potato)
			.find((entry) => entry.meta?.key === 'ultimate_crop_fever')!;
		const previous = new FarmingPlayer({
			...player.options,
			tools: [{ ...player.tools[0]!.item, enchantments: { ultimate_crop_fever: 4 } }],
		});
		const impact = previous.getUpgradeRateImpact(upgrade, { crop: Crop.Potato, blocksBroken: 72_000 });
		expect(impact.after.fortune - impact.before.fortune).toBeCloseTo(
			activeFortune * (getCropFeverUptime(5, Crop.Potato) - getCropFeverUptime(4, Crop.Potato)),
			8
		);
	});

	// Weighted quantities of each actual item from the four reward tiers; the denominator
	// includes the 20,000-weight no-drop outcome as well as all reward weights.
	test.each([
		[Crop.Wheat, { ENCHANTED_WHEAT: 1780, ENCHANTED_HAY_BALE: 12 }],
		[Crop.Carrot, { ENCHANTED_CARROT: 3300, ENCHANTED_GOLDEN_CARROT: 40 }],
		[Crop.Potato, { ENCHANTED_POTATO: 2900, ENCHANTED_BAKED_POTATO: 20 }],
		[Crop.Pumpkin, { ENCHANTED_PUMPKIN: 1790, POLISHED_PUMPKIN: 4 }],
		[Crop.SugarCane, { ENCHANTED_SUGAR: 2040, ENCHANTED_SUGAR_CANE: 13 }],
		[Crop.Melon, { ENCHANTED_MELON: 4080, ENCHANTED_MELON_BLOCK: 40 }],
		[Crop.Cactus, { ENCHANTED_CACTUS_GREEN: 1260, ENCHANTED_CACTUS: 13 }],
		[Crop.CocoaBeans, { ENCHANTED_COCOA: 1860, ENCHANTED_COOKIE: 4 }],
		[
			Crop.Mushroom,
			{
				ENCHANTED_BROWN_MUSHROOM: 930,
				ENCHANTED_HUGE_MUSHROOM_1: 8,
				ENCHANTED_RED_MUSHROOM: 930,
				ENCHANTED_HUGE_MUSHROOM_2: 8,
			},
		],
		[Crop.NetherWart, { ENCHANTED_NETHER_STALK: 3060, MUTANT_NETHER_STALK: 20 }],
		[Crop.Sunflower, { ENCHANTED_SUNFLOWER: 2040, COMPACTED_SUNFLOWER: 20 }],
		[Crop.Moonflower, { ENCHANTED_MOONFLOWER: 2040, COMPACTED_MOONFLOWER: 20 }],
		[Crop.WildRose, { ENCHANTED_WILD_ROSE: 2040, COMPACTED_WILD_ROSE: 20 }],
	] as const)('%s receives its individual rewards, fortune, and Overbloom', (crop, weightedRewards) => {
		const baseline = playerWithFever(crop, 0).getRates(crop, 72_000, 20);
		const rates = playerWithFever(crop, 5).getRates(crop, 72_000, 20);
		const uptime = getCropFeverUptime(5, crop, 20);
		for (const [itemId, weightedAmount] of Object.entries(weightedRewards)) {
			const expected = (72_000 * uptime * (CROP_INFO[crop].breaks ?? 1) * weightedAmount) / 20_138;
			expect(rates.rngItems?.[itemId]).toBeCloseTo(expected, 10);
			expect(rates.items[itemId]).toBeUndefined();
			expect(rates.appliedEffects[itemId]?.find((effect) => effect.source === 'Crop Fever')?.amount).toBeCloseTo(
				expected,
				10
			);
		}
		expect(rates.otherCollection['Crop Fever']).toBeUndefined();
		expect(rates.coinSources['Crop Fever']).toBeUndefined();
		expect(rates.fortune - baseline.fortune).toBeCloseTo(100 * uptime, 8);
		expect(rates.effectsBreakdown['Crop Fever']).toBeCloseTo(15 * uptime, 8);
		expect(rates.rngItems?.RAREFINDER_GARDEN_CHIP).toBeCloseTo(0.36 * (1 + 0.15 * uptime), 12);
		expect(rates.currencies.SEASONING).toBeCloseTo(baseline.currencies.SEASONING! * (1 + 0.15 * uptime), 8);
		expect(rates.collection - baseline.collection).toBeCloseTo(
			rates.otherCollection.Normal! - baseline.otherCollection.Normal!,
			8
		);
		expect(rates.npcCoins).toBeCloseTo(
			Object.values(rates.coinSources).reduce((a, b) => a + b, 0),
			8
		);
	});

	test('bonus reward rolls are not multiplied by Overbloom or Farming Fortune', () => {
		const player = playerWithFever(Crop.Potato, 5, { feast: 5, harvesting: 6 });
		const baseline = playerWithFever(Crop.Potato, 5).getRates(Crop.Potato, 72_000);
		const rates = player.getRates(Crop.Potato, 72_000);
		expect(rates.rngItems?.ENCHANTED_POTATO).toBe(baseline.rngItems?.ENCHANTED_POTATO);
		expect(rates.rngItems?.ENCHANTED_BAKED_POTATO).toBe(baseline.rngItems?.ENCHANTED_BAKED_POTATO);
		expect(rates.currencies.SEASONING).toBeGreaterThan(baseline.currencies.SEASONING!);
		expect(rates.fortune).toBeGreaterThan(baseline.fortune);
	});

	test('Crop Fever works outside Harvest Feast', () => {
		const tool = playerWithFever(Crop.Potato, 5).tools[0]!.item;
		const player = new FarmingPlayer({ tools: [tool] });
		expect(player.getRates(Crop.Potato, 72_000).rngItems?.ENCHANTED_POTATO).toBeGreaterThan(0);
		expect(player.getRates(Crop.Potato, 72_000).currencies.SEASONING).toBeUndefined();
	});

	test('pest cycles use each phase speed independently of the phase block count', () => {
		const tool = playerWithFever(Crop.Potato, 5).tools[0]!.item;
		const player = new PestFarmingPlayer({ tools: [tool] });
		const result = new PestFarmingRateCalculator({
			player,
			options: {
				crop: Crop.Potato,
				cycle: { ...DEFAULT_PEST_CYCLE_SETTINGS, blocksPerSecond: 20, spawnBlocksPerSecond: 10 },
			},
		}).calculate();
		expect(result.breakdown.cropBreaking.farm.rngItems?.ENCHANTED_POTATO).toBeCloseTo(
			(result.debug.farmBlocks * (3 / 53) * 2900) / 20_138,
			8
		);
		expect(result.breakdown.cropBreaking.spawn.rngItems?.ENCHANTED_POTATO).toBeCloseTo(
			(result.debug.spawnBlocks * (3 / 103) * 2900) / 20_138,
			8
		);
	});

	test('changing the interval preserves uptime, while changing speed changes uptime', () => {
		const player = playerWithFever(Crop.Potato, 5);
		const hour = player.getRates(Crop.Potato, 72_000, 20);
		const halfHour = player.getRates(Crop.Potato, 36_000, 20);
		const slower = player.getRates(Crop.Potato, 36_000, 10);
		expect(halfHour.fortune).toBe(hour.fortune);
		expect(halfHour.rngItems?.ENCHANTED_POTATO).toBeCloseTo(hour.rngItems!.ENCHANTED_POTATO! / 2, 8);
		expect(slower.fortune).toBeLessThan(halfHour.fortune);
		expect(slower.rngItems?.ENCHANTED_POTATO).toBeLessThan(halfHour.rngItems!.ENCHANTED_POTATO!);
	});

	test('wheat fortune also benefits seeds, without duplicating the wheat jackpot', () => {
		const player = playerWithFever(Crop.Wheat, 5);
		const rates = player.getRates(Crop.Wheat, 72_000);
		const expectedSeeds = Math.round(72_000 * 1.5 * (1 + rates.fortune / 100)) - 72_000;
		expect(rates.items[Crop.Seeds]).toBe(expectedSeeds);
		expect(rates.appliedEffects.ENCHANTED_WHEAT?.filter((effect) => effect.source === 'Crop Fever')).toHaveLength(
			1
		);
		expect(rates.rngItems?.ENCHANTED_SEEDS).toBeUndefined();
	});

	test('only the selected crop tool supplies Crop Fever', () => {
		const player = playerWithFever(Crop.Potato, 5);
		const plainTool = playerWithFever(Crop.Potato, 0).tools[0]!;
		plainTool.item.uuid = 'plain-tool';
		player.tools.push(plainTool);
		player.selectedTool = plainTool;
		expect(player.getRates(Crop.Potato, 72_000).rngItems?.ENCHANTED_POTATO).toBeUndefined();
	});

	test.each([0, 1, 2, 3, 4])('level %i exposes the next upgrade with a positive rate impact', (level) => {
		const player = playerWithFever(Crop.Potato, level);
		const upgrade = player.getCropUpgrades(Crop.Potato).find((entry) => entry.meta?.key === 'ultimate_crop_fever');
		expect(upgrade?.meta?.value).toBe(level + 1);
		expect(upgrade?.effects?.[0]?.mechanic).toBe(FarmingMechanic.CropFeverChance);
		expect(upgrade?.cost?.items?.ENCHANTMENT_ULTIMATE_CROP_FEVER_1).toBe(level === 0 ? 1 : 2 ** (level - 1));
		const impact = player.getUpgradeRateImpact(upgrade!, {
			crop: Crop.Potato,
			blocksBroken: 36_000,
			blocksPerSecond: 10,
		});
		expect(impact.delta.collection).toBeGreaterThan(0);
		expect(impact.delta.rngItems.ENCHANTED_POTATO).toBeGreaterThan(0);
		expect(impact.delta.rngItems.ENCHANTED_BAKED_POTATO).toBeGreaterThan(0);
		expect(impact.delta.npcCoins).toBeGreaterThan(0);
		expect(impact.after.fortune - impact.before.fortune).toBeCloseTo(
			100 * (getCropFeverUptime(level + 1, Crop.Potato, 10) - getCropFeverUptime(level, Crop.Potato, 10)),
			8
		);
		expect(player.tools[0]?.item.enchantments?.ultimate_crop_fever).toBe(level);
	});

	test('max level has no further Crop Fever upgrade', () => {
		const player = playerWithFever(Crop.Potato, 5);
		expect(player.getCropUpgrades(Crop.Potato).some((entry) => entry.meta?.key === 'ultimate_crop_fever')).toBe(
			false
		);
	});
});
