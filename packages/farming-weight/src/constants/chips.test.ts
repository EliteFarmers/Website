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
