import type { CalculateCropDetailedDropsOptions, DetailedDropsResult } from '../util/ratecalc.js';
import { Rarity, type RarityRecord } from './reforges.js';
import { Stat } from './stats.js';

export const GARDEN_CHIP_MAX_LEVEL = 20 as const;
export const GARDEN_CHIP_WIKI = 'https://wiki.hypixel.net/Garden_Chip' as const;

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
	 * Modifier for drop rates. Applied during rate calculations.
	 */
	ratesModifier?: (current: DetailedDropsResult, options: CalculateCropDetailedDropsOptions) => DetailedDropsResult;
}

export const GARDEN_CHIPS: Record<GardenChipId, GardenChipInfo> = {
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
	overdrive: {
		skyblockId: 'OVERDRIVE_GARDEN_CHIP',
		name: 'Overdrive Chip',
		wiki: GARDEN_CHIP_WIKI,
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
		ratesModifier: (current, options) => {
			const level = getChipLevel(getChipInputLevel(options.chips, 'rarefinder'));
			if (level <= 0) return current;

			const rarity = getChipRarity(level);
			let perLevel = 0.02;
			if (rarity === Rarity.Epic) perLevel = 0.025;
			else if (rarity === Rarity.Legendary) perLevel = 0.03;

			const bonus = level * perLevel;
			current.rareItemBonus += bonus;
			current.rareItemBonusBreakdown['Rarefinder Chip'] = bonus;
			return current;
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

/**
 * Type that accepts either the full chip ID or the short name.
 * E.g., both 'CROPSHOT_GARDEN_CHIP' and 'CROPSHOT' are valid.
 */
export type ChipIdInput = GardenChipId | string;
