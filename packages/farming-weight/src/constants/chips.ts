import { compareRarity, Rarity, type RarityRecord } from './reforges.js';
import { Stat } from './stats.js';

export const GARDEN_CHIP_MAX_LEVEL = 20 as const;
export const GARDEN_CHIP_WIKI = 'https://w.elitesb.gg/Garden_Chip' as const;
export type GardenChipRarity = Rarity.Rare | Rarity.Epic | Rarity.Legendary;
export const GARDEN_CHIP_RARITIES = [Rarity.Rare, Rarity.Epic, Rarity.Legendary] as const;
export const GARDEN_CHIP_RARITY_MAX_LEVELS: Record<GardenChipRarity, number> = {
	[Rarity.Rare]: 10,
	[Rarity.Epic]: 15,
	[Rarity.Legendary]: 20,
};
export const GARDEN_CHIP_SOWDUST_COSTS: Partial<Record<number, number>> = {
	2: 100_000,
	3: 200_000,
	4: 300_000,
	5: 400_000,
	6: 550_000,
	7: 700_000,
	8: 850_000,
	9: 1_000_000,
	10: 1_150_000,
	11: 1_300_000,
	12: 1_450_000,
	13: 1_600_000,
	14: 1_750_000,
	15: 1_900_000,
	16: 2_050_000,
	17: 2_200_000,
	18: 2_350_000,
	19: 2_500_000,
	20: 2_650_000,
};
export const GARDEN_CHIP_RARITY_ITEM_TOTALS: Record<GardenChipRarity, number> = {
	[Rarity.Rare]: 1,
	[Rarity.Epic]: 4,
	[Rarity.Legendary]: 16,
};
export const GARDEN_CHIP_RARITY_ITEM_COSTS: Record<GardenChipRarity, number> = {
	[Rarity.Rare]: 1,
	[Rarity.Epic]: GARDEN_CHIP_RARITY_ITEM_TOTALS[Rarity.Epic] - GARDEN_CHIP_RARITY_ITEM_TOTALS[Rarity.Rare],
	[Rarity.Legendary]: GARDEN_CHIP_RARITY_ITEM_TOTALS[Rarity.Legendary] - GARDEN_CHIP_RARITY_ITEM_TOTALS[Rarity.Epic],
};

export type GardenChipId =
	| 'cropshot'
	| 'vermin_vaporizer'
	| 'synthesis'
	| 'sowledge'
	| 'mechamind'
	| 'hypercharge'
	| 'evergreen'
	| 'overdrive'
	| 'quickdraw'
	| 'rarefinder';

export interface GardenChipInfo {
	skyblockId: string;
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
	/**
	 * Per-level fortune for the active crop.
	 * Used by contest-dependent chips such as Overdrive.
	 */
	cropFortunePerRarity?: RarityRecord<number>;
}

export const GARDEN_CHIPS: Record<GardenChipId, GardenChipInfo> = {
	vermin_vaporizer: {
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
	synthesis: {
		skyblockId: 'SYNTHESIS_GARDEN_CHIP',
		name: 'Synthesis Chip',
		wiki: GARDEN_CHIP_WIKI,
	},
	sowledge: {
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
	mechamind: {
		skyblockId: 'MECHAMIND_GARDEN_CHIP',
		name: 'Mechamind Chip',
		wiki: GARDEN_CHIP_WIKI,
	},
	hypercharge: {
		skyblockId: 'HYPERCHARGE_GARDEN_CHIP',
		name: 'Hypercharge Chip',
		wiki: GARDEN_CHIP_WIKI,
		tempMultiplierPerLevel: {
			[Rarity.Rare]: 0.03,
			[Rarity.Epic]: 0.04,
			[Rarity.Legendary]: 0.05,
		},
	},
	evergreen: {
		skyblockId: 'EVERGREEN_GARDEN_CHIP',
		name: 'Evergreen Chip',
		wiki: GARDEN_CHIP_WIKI,
	},
	cropshot: {
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
	overdrive: {
		skyblockId: 'OVERDRIVE_GARDEN_CHIP',
		name: 'Overdrive Chip',
		wiki: GARDEN_CHIP_WIKI,
		cropFortunePerRarity: {
			[Rarity.Rare]: 5,
			[Rarity.Epic]: 6,
			[Rarity.Legendary]: 7,
		},
	},
	quickdraw: {
		skyblockId: 'QUICKDRAW_GARDEN_CHIP',
		name: 'Quickdraw Chip',
		wiki: GARDEN_CHIP_WIKI,
	},
	rarefinder: {
		skyblockId: 'RAREFINDER_GARDEN_CHIP',
		name: 'Rarefinder Chip',
		wiki: GARDEN_CHIP_WIKI,
		statsPerRarity: {
			[Rarity.Rare]: {
				[Stat.Overbloom]: 1.5,
			},
			[Rarity.Epic]: {
				[Stat.Overbloom]: 2,
			},
			[Rarity.Legendary]: {
				[Stat.Overbloom]: 2.5,
			},
		},
	},
};

const CHIP_ID_LOOKUP: Record<string, GardenChipId> = Object.entries(GARDEN_CHIPS).reduce(
	(acc, [chipId, chip]) => {
		const id = chipId as GardenChipId;
		const canonical = chipId.toLowerCase();
		const skyblock = chip.skyblockId.toLowerCase();
		const shortFromSkyblock = skyblock.replace(/_garden_chip$/, '');

		const aliases = [
			canonical,
			canonical.replace(/_/g, ''),
			skyblock,
			skyblock.replace(/_/g, ''),
			shortFromSkyblock,
			shortFromSkyblock.replace(/_/g, ''),
		];

		for (const alias of aliases) {
			acc[alias] = id;
		}

		return acc;
	},
	{} as Record<string, GardenChipId>
);

export function getChipLevel(level?: number | null): number {
	if (!level || level <= 0) return 0;
	return Math.min(Math.max(Math.floor(level), 0), GARDEN_CHIP_MAX_LEVEL);
}

export function getMinimumChipRarityForLevel(level?: number | null): GardenChipRarity {
	const chipLevel = getChipLevel(level);
	if (chipLevel > 15) return Rarity.Legendary;
	if (chipLevel > 10) return Rarity.Epic;
	return Rarity.Rare;
}

export function normalizeChipRarity(rarity?: string | Rarity | null): GardenChipRarity | undefined {
	if (!rarity) return undefined;
	const normalized = String(rarity)
		.trim()
		.toLowerCase()
		.replace(/[\s_-]+/g, '');
	if (normalized === 'rare') return Rarity.Rare;
	if (normalized === 'epic') return Rarity.Epic;
	if (normalized === 'legendary') return Rarity.Legendary;
	return undefined;
}

export function getChipRarity(level?: number | null, rarityOverride?: string | Rarity | null): GardenChipRarity {
	const minimumRarity = getMinimumChipRarityForLevel(level);
	const override = normalizeChipRarity(rarityOverride);
	if (override && compareRarity(override, minimumRarity) >= 0) return override;
	return minimumRarity;
}

export function getChipMaxLevelForRarity(rarity?: string | Rarity | null): number {
	return GARDEN_CHIP_RARITY_MAX_LEVELS[normalizeChipRarity(rarity) ?? Rarity.Rare];
}

export function getChipNextLevelCost(level?: number | null): number {
	return GARDEN_CHIP_SOWDUST_COSTS[getChipLevel(level) + 1] ?? 0;
}

export function getNextChipRarity(rarity?: string | Rarity | null): GardenChipRarity | undefined {
	const current = normalizeChipRarity(rarity) ?? Rarity.Rare;
	if (current === Rarity.Rare) return Rarity.Epic;
	if (current === Rarity.Epic) return Rarity.Legendary;
	return undefined;
}

export function getChipRarityUpgradeCost(rarity?: string | Rarity | null): number {
	const nextRarity = getNextChipRarity(rarity);
	return nextRarity ? GARDEN_CHIP_RARITY_ITEM_COSTS[nextRarity] : 0;
}

export function getChipStats(
	chipId: GardenChipId,
	level?: number | null,
	rarityOverride?: string | Rarity | null
): Partial<Record<Stat, number>> {
	const chipInfo = GARDEN_CHIPS[chipId];
	if (!chipInfo.statsPerRarity) return {};
	const rarity = getChipRarity(level, rarityOverride);
	return chipInfo.statsPerRarity[rarity] ?? {};
}

/** Returns the per-level multiplier for temporary fortune sources for a chip, based on effective rarity. */
export function getChipTempMultiplierPerLevel(
	chipId: GardenChipId,
	level?: number | null,
	rarityOverride?: string | Rarity | null
): number {
	const chipInfo = GARDEN_CHIPS[chipId];
	if (!chipInfo.tempMultiplierPerLevel) return 0;
	const rarity = getChipRarity(level, rarityOverride);
	return chipInfo.tempMultiplierPerLevel[rarity] ?? 0;
}

/**
 * Normalizes chip identifiers to the canonical GardenChipId format.
 * Accepts canonical IDs, full SkyBlock IDs, and short names.
 */
export function normalizeChipId(id: string): GardenChipId | undefined {
	const normalized = id
		.trim()
		.toLowerCase()
		.replace(/[\s-]+/g, '_');
	return CHIP_ID_LOOKUP[normalized] ?? CHIP_ID_LOOKUP[normalized.replace(/_/g, '')];
}

export function normalizeChipLevels(
	chips?: Record<string, number | null | undefined>
): Partial<Record<GardenChipId, number>> | undefined {
	if (!chips) return undefined;

	const normalized: Partial<Record<GardenChipId, number>> = {};
	for (const [id, level] of Object.entries(chips)) {
		const chipId = normalizeChipId(id);
		if (!chipId || level === undefined || level === null) continue;
		normalized[chipId] = level;
	}

	return normalized;
}

export function normalizeChipRarities(
	chipRarities?: Record<string, string | Rarity | null | undefined>
): Partial<Record<GardenChipId, GardenChipRarity>> | undefined {
	if (!chipRarities) return undefined;

	const normalized: Partial<Record<GardenChipId, GardenChipRarity>> = {};
	for (const [id, rarity] of Object.entries(chipRarities)) {
		const chipId = normalizeChipId(id);
		const chipRarity = normalizeChipRarity(rarity);
		if (!chipId || !chipRarity) continue;
		normalized[chipId] = chipRarity;
	}

	return normalized;
}

export function getChipInputLevel(
	chips: Record<string, number | null | undefined> | undefined,
	chipId: GardenChipId
): number {
	if (!chips) return 0;

	const direct = chips[chipId];
	if (direct !== undefined && direct !== null) return direct;

	const legacyId = GARDEN_CHIPS[chipId].skyblockId;
	const legacy = chips[legacyId];
	if (legacy !== undefined && legacy !== null) return legacy;

	for (const [id, level] of Object.entries(chips)) {
		if (level === undefined || level === null) continue;
		if (normalizeChipId(id) === chipId) return level;
	}

	return 0;
}

export function getChipInputRarity(
	chipRarities: Record<string, string | Rarity | null | undefined> | undefined,
	chipId: GardenChipId
): GardenChipRarity | undefined {
	if (!chipRarities) return undefined;

	const direct = normalizeChipRarity(chipRarities[chipId]);
	if (direct) return direct;

	const legacyId = GARDEN_CHIPS[chipId].skyblockId;
	const legacy = normalizeChipRarity(chipRarities[legacyId]);
	if (legacy) return legacy;

	for (const [id, rarity] of Object.entries(chipRarities)) {
		const normalizedRarity = normalizeChipRarity(rarity);
		if (!normalizedRarity) continue;
		if (normalizeChipId(id) === chipId) return normalizedRarity;
	}

	return undefined;
}

/**
 * Type that accepts either the full chip ID or the short name.
 * E.g., both 'CROPSHOT_GARDEN_CHIP' and 'CROPSHOT' are valid.
 */
export type ChipIdInput = GardenChipId | string;
