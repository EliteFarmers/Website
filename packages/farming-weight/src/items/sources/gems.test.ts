import { describe, expect, test } from 'vitest';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { type EliteItemDto, GemRarity } from '../../fortune/item.js';
import { GEMSTONE_SOURCES } from '../gems/index.js';
import { gemEffects, gemSlotDeltaEffects, gemStat } from './gems.js';

function item(gems: NonNullable<EliteItemDto['gems']>): EliteItemDto {
	return {
		name: 'Gemmed Item',
		skyblockId: 'GEMMED_ITEM',
		uuid: 'gemmed-item',
		gems,
		attributes: {},
		enchantments: {},
		lore: [],
	};
}

describe('class-backed gemstone sources', () => {
	test('registry exposes Peridot as a Farming Fortune source', () => {
		expect(GEMSTONE_SOURCES.PERIDOT?.info.stat).toBe(Stat.FarmingFortune);
		expect(GEMSTONE_SOURCES.PERIDOT?.getStat(Rarity.Legendary, GemRarity.Perfect)).toBe(8);
	});

	test('gemStat delegates slot parsing through gemstone sources', () => {
		const gear = item({
			PERIDOT_0: GemRarity.Flawless,
			RUBY_0: GemRarity.Perfect,
		});

		expect(gemStat(gear, Stat.FarmingFortune, Rarity.Legendary)).toBe(6);
		expect(gemStat(gear, Stat.Health, Rarity.Legendary)).toBe(24);
	});

	test('gemEffects emits declarative stat effects with host multipliers', () => {
		const gear = item({
			PERIDOT_0: GemRarity.Perfect,
		});

		expect(gemEffects(gear, Rarity.Legendary, 'Gemmed Item (Gems)')).toEqual([
			{ source: 'Gemmed Item (Gems)', op: 'add-stat', stat: Stat.FarmingFortune, value: 8 },
		]);
		expect(gemEffects(gear, Rarity.Legendary, 'Gemmed Item (Gems)', 0.5)).toEqual([
			{ source: 'Gemmed Item (Gems)', op: 'add-stat', stat: Stat.FarmingFortune, value: 4 },
		]);
	});

	test('gemSlotDeltaEffects calculates upgrade deltas from the same class source', () => {
		expect(
			gemSlotDeltaEffects('PERIDOT_0', Rarity.Legendary, GemRarity.Fine, GemRarity.Flawless, 'Gemmed Item (Gems)')
		).toEqual([{ source: 'Gemmed Item (Gems)', op: 'add-stat', stat: Stat.FarmingFortune, value: 1 }]);
	});
});
