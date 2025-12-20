import { expect, test } from 'vitest';
import { GARDEN_CHIP_MAX_LEVEL, getChipLevel, normalizeChipId } from './chips';

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
	expect(normalizeChipId('CROPSHOT_GARDEN_CHIP')).toBe('CROPSHOT_GARDEN_CHIP');
	expect(normalizeChipId('VERMIN_VAPORIZER_GARDEN_CHIP')).toBe('VERMIN_VAPORIZER_GARDEN_CHIP');
	expect(normalizeChipId('OVERDRIVE_GARDEN_CHIP')).toBe('OVERDRIVE_GARDEN_CHIP');

	// Short names should work
	expect(normalizeChipId('CROPSHOT')).toBe('CROPSHOT_GARDEN_CHIP');
	expect(normalizeChipId('VERMIN_VAPORIZER')).toBe('VERMIN_VAPORIZER_GARDEN_CHIP');
	expect(normalizeChipId('OVERDRIVE')).toBe('OVERDRIVE_GARDEN_CHIP');

	// Case insensitive
	expect(normalizeChipId('cropshot')).toBe('CROPSHOT_GARDEN_CHIP');
	expect(normalizeChipId('Cropshot_Garden_Chip')).toBe('CROPSHOT_GARDEN_CHIP');

	// Invalid IDs should return undefined
	expect(normalizeChipId('INVALID_CHIP')).toBeUndefined();
	expect(normalizeChipId('CROPSHOT_INVALID')).toBeUndefined();
});
