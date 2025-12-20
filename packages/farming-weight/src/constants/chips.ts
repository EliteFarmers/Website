import { Rarity, type RarityRecord } from './reforges.js';
import { Stat } from './stats.js';

export const GARDEN_CHIP_MAX_LEVEL = 20 as const;
export const GARDEN_CHIP_WIKI = 'https://wiki.hypixel.net/Garden_Chip' as const;

export type GardenChipId =
	| 'CROPSHOT_GARDEN_CHIP'
	| 'VERMIN_VAPORIZER_GARDEN_CHIP'
	| 'SYNTHESIS_GARDEN_CHIP'
	| 'SOWLEDGE_GARDEN_CHIP'
	| 'MECHAMIND_GARDEN_CHIP'
	| 'HYPERCHARGE_GARDEN_CHIP'
	| 'EVERGREEN_GARDEN_CHIP'
	| 'OVERDRIVE_GARDEN_CHIP'
	| 'QUICKDRAW_GARDEN_CHIP'
	| 'RAREFINDER_GARDEN_CHIP';

export interface GardenChipInfo {
	skyblockId: GardenChipId;
	name: string;
	wiki: string;
	/**
	 * Some chips map cleanly to existing stats. Others are progress-only for now.
	 */
	statsPerRarity?: RarityRecord<Partial<Record<Stat, number>>>;
	/**
	 * Per-level multiplier for temporary fortune sources, by rarity.
	 * Used by Hypercharge Chip.
	 */
	tempMultiplierPerLevel?: RarityRecord<number>;
}

export const GARDEN_CHIPS: Record<GardenChipId, GardenChipInfo> = {
	CROPSHOT_GARDEN_CHIP: {
		skyblockId: 'CROPSHOT_GARDEN_CHIP',
		name: 'Cropshot Chip',
		wiki: GARDEN_CHIP_WIKI,
		statsPerRarity: {
			[Rarity.Rare]: {
				[Stat.FarmingFortune]: 3,
			},
			[Rarity.Epic]: {
				[Stat.FarmingFortune]: 4,
			},
			[Rarity.Legendary]: {
				[Stat.FarmingFortune]: 5,
			},
		},
	},
	VERMIN_VAPORIZER_GARDEN_CHIP: {
		skyblockId: 'VERMIN_VAPORIZER_GARDEN_CHIP',
		name: 'Vermin Vaporizer Chip',
		wiki: GARDEN_CHIP_WIKI,
		statsPerRarity: {
			[Rarity.Rare]: {
				[Stat.BonusPestChance]: 3,
			},
			[Rarity.Epic]: {
				[Stat.BonusPestChance]: 4,
			},
			[Rarity.Legendary]: {
				[Stat.BonusPestChance]: 5,
			},
		},
	},
	SYNTHESIS_GARDEN_CHIP: {
		skyblockId: 'SYNTHESIS_GARDEN_CHIP',
		name: 'Synthesis Chip',
		wiki: GARDEN_CHIP_WIKI,
	},
	SOWLEDGE_GARDEN_CHIP: {
		skyblockId: 'SOWLEDGE_GARDEN_CHIP',
		name: 'Sowledge Chip',
		wiki: GARDEN_CHIP_WIKI,
		statsPerRarity: {
			[Rarity.Rare]: {
				[Stat.FarmingWisdom]: 1,
			},
			[Rarity.Epic]: {
				[Stat.FarmingWisdom]: 1.25,
			},
			[Rarity.Legendary]: {
				[Stat.FarmingWisdom]: 1.5,
			},
		},
	},
	MECHAMIND_GARDEN_CHIP: {
		skyblockId: 'MECHAMIND_GARDEN_CHIP',
		name: 'Mechamind Chip',
		wiki: GARDEN_CHIP_WIKI,
	},
	HYPERCHARGE_GARDEN_CHIP: {
		skyblockId: 'HYPERCHARGE_GARDEN_CHIP',
		name: 'Hypercharge Chip',
		wiki: GARDEN_CHIP_WIKI,
		tempMultiplierPerLevel: {
			[Rarity.Rare]: 0.03,
			[Rarity.Epic]: 0.04,
			[Rarity.Legendary]: 0.05,
		},
	},
	EVERGREEN_GARDEN_CHIP: {
		skyblockId: 'EVERGREEN_GARDEN_CHIP',
		name: 'Evergreen Chip',
		wiki: GARDEN_CHIP_WIKI,
	},
	OVERDRIVE_GARDEN_CHIP: {
		skyblockId: 'OVERDRIVE_GARDEN_CHIP',
		name: 'Overdrive Chip',
		wiki: GARDEN_CHIP_WIKI,
	},
	QUICKDRAW_GARDEN_CHIP: {
		skyblockId: 'QUICKDRAW_GARDEN_CHIP',
		name: 'Quickdraw Chip',
		wiki: GARDEN_CHIP_WIKI,
	},
	RAREFINDER_GARDEN_CHIP: {
		skyblockId: 'RAREFINDER_GARDEN_CHIP',
		name: 'Rarefinder Chip',
		wiki: GARDEN_CHIP_WIKI,
	},
};

export function getChipLevel(level?: number | null): number {
	if (!level || level <= 0) return 0;
	return Math.min(Math.max(Math.floor(level), 0), GARDEN_CHIP_MAX_LEVEL);
}

export function getChipRarity(level?: number | null): Rarity {
	const chipLevel = getChipLevel(level);
	if (chipLevel > 15) return Rarity.Legendary;
	if (chipLevel > 10) return Rarity.Epic;
	return Rarity.Rare;
}

export function getChipStats(chipId: GardenChipId, level?: number | null): Partial<Record<Stat, number>> {
	const chipInfo = GARDEN_CHIPS[chipId];
	if (!chipInfo.statsPerRarity) return {};
	const rarity = getChipRarity(level);
	return chipInfo.statsPerRarity[rarity] ?? {};
}

/** Returns the per-level multiplier for temporary fortune sources for a chip, based on level-derived rarity. */
export function getChipTempMultiplierPerLevel(chipId: GardenChipId, level?: number | null): number {
	const chipInfo = GARDEN_CHIPS[chipId];
	if (!chipInfo.tempMultiplierPerLevel) return 0;
	const rarity = getChipRarity(level);
	return chipInfo.tempMultiplierPerLevel[rarity] ?? 0;
}

/**
 * Normalizes a chip ID or short name to the full GardenChipId format.
 * Accepts both 'CROPSHOT_GARDEN_CHIP' and 'CROPSHOT'.
 */
export function normalizeChipId(id: string): GardenChipId | undefined {
	const upperId = id.toUpperCase();

	// If it's already a valid full ID, return it
	if (upperId in GARDEN_CHIPS) {
		return upperId as GardenChipId;
	}

	// Try adding _GARDEN_CHIP suffix
	const fullId = `${upperId}_GARDEN_CHIP` as GardenChipId;
	if (fullId in GARDEN_CHIPS) {
		return fullId;
	}

	return undefined;
}

/**
 * Type that accepts either the full chip ID or the short name.
 * E.g., both 'CROPSHOT_GARDEN_CHIP' and 'CROPSHOT' are valid.
 */
export type ChipIdInput = GardenChipId | string;
