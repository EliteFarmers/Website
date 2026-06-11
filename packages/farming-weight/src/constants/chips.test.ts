import { expect, test } from 'vitest';
import {
	GARDEN_CHIP_MAX_LEVEL,
	getChipLevel,
	getChipNextLevelCost,
	getChipRarity,
	getChipRarityUpgradeCost,
	normalizeChipId,
	normalizeChipRarities,
} from './chips.js';
import { Rarity } from './reforges.js';

test('Garden chip level clamp test', () => {
	expect(getChipLevel(undefined)).toBe(0);
	expect(getChipLevel(null)).toBe(0);
	expect(getChipLevel(0)).toBe(0);
	expect(getChipLevel(-5)).toBe(0);

	expect(getChipLevel(1)).toBe(1);
	expect(getChipLevel(1.9)).toBe(1);
	expect(getChipLevel(GARDEN_CHIP_MAX_LEVEL)).toBe(GARDEN_CHIP_MAX_LEVEL);
	expect(getChipLevel(GARDEN_CHIP_MAX_LEVEL + 100)).toBe(GARDEN_CHIP_MAX_LEVEL);
});

test('Normalize chip ID accepts both full and short names', () => {
	// Full IDs should work
	expect(normalizeChipId('CROPSHOT_GARDEN_CHIP')).toBe('cropshot');
	expect(normalizeChipId('VERMIN_VAPORIZER_GARDEN_CHIP')).toBe('vermin_vaporizer');
	expect(normalizeChipId('OVERDRIVE_GARDEN_CHIP')).toBe('overdrive');

	// Short names should work
	expect(normalizeChipId('CROPSHOT')).toBe('cropshot');
	expect(normalizeChipId('VERMIN_VAPORIZER')).toBe('vermin_vaporizer');
	expect(normalizeChipId('OVERDRIVE')).toBe('overdrive');
	expect(normalizeChipId('VERMINVAPORIZER')).toBe('vermin_vaporizer');

	// Case insensitive
	expect(normalizeChipId('cropshot')).toBe('cropshot');
	expect(normalizeChipId('Cropshot_Garden_Chip')).toBe('cropshot');
	expect(normalizeChipId('verminVaporizer')).toBe('vermin_vaporizer');

	// Invalid IDs should return undefined
	expect(normalizeChipId('INVALID_CHIP')).toBeUndefined();
	expect(normalizeChipId('CROPSHOT_INVALID')).toBeUndefined();
});

test('Garden chip rarity is inferred from level and can be overridden upward', () => {
	expect(getChipRarity(0)).toBe(Rarity.Rare);
	expect(getChipRarity(10)).toBe(Rarity.Rare);
	expect(getChipRarity(11)).toBe(Rarity.Epic);
	expect(getChipRarity(15)).toBe(Rarity.Epic);
	expect(getChipRarity(16)).toBe(Rarity.Legendary);

	expect(getChipRarity(10, Rarity.Legendary)).toBe(Rarity.Legendary);
	expect(getChipRarity(12, Rarity.Rare)).toBe(Rarity.Epic);
	expect(getChipRarity(20, Rarity.Rare)).toBe(Rarity.Legendary);
});

test('Garden chip rarity inputs normalize full ids, short ids, and labels', () => {
	expect(
		normalizeChipRarities({
			CROPSHOT_GARDEN_CHIP: 'legendary',
			verminVaporizer: 'EPIC',
			invalid: 'rare',
			rarefinder: 'unknown',
		})
	).toStrictEqual({
		cropshot: Rarity.Legendary,
		vermin_vaporizer: Rarity.Epic,
	});
});

test('Garden chip upgrade costs use sowdust for levels and chip items for rarity', () => {
	expect(getChipNextLevelCost(1)).toBe(100_000);
	expect(getChipNextLevelCost(10)).toBe(1_300_000);
	expect(getChipNextLevelCost(19)).toBe(2_650_000);
	expect(getChipNextLevelCost(20)).toBe(0);

	expect(getChipRarityUpgradeCost(Rarity.Rare)).toBe(3);
	expect(getChipRarityUpgradeCost(Rarity.Epic)).toBe(12);
	expect(getChipRarityUpgradeCost(Rarity.Legendary)).toBe(0);
});
