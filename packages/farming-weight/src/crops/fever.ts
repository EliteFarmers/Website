import {
	getChipInputLevel,
	getChipInputRarity,
	getChipLevel,
	getChipTempMultiplierPerLevel,
} from '../constants/chips.js';
import { Crop, CROP_INFO } from '../constants/crops.js';
import { Stat } from '../constants/stats.js';
import type { Effect } from '../effects/types.js';
import { statsToEffects } from '../items/sources/effects-util.js';
import type { PlayerOptions } from '../player/playeroptions.js';

const DURATION_SECONDS = 60;
const TOTAL_DROP_WEIGHT = 20_000 + 90 + 40 + 7 + 1;

// Actual item quantities for uncommon, rare, crazy rare, and RNGesus rewards.
// https://hypixelskyblock.minecraft.wiki/w/Crop_Fever
const REWARDS: Partial<Record<Crop, Record<string, readonly [number, number, number, number]>>> = {
	[Crop.Wheat]: { ENCHANTED_WHEAT: [6, 10, 120, 0], ENCHANTED_HAY_BALE: [0, 0, 0, 12] },
	[Crop.Carrot]: { ENCHANTED_CARROT: [18, 42, 0, 0], ENCHANTED_GOLDEN_CARROT: [0, 0, 4, 12] },
	[Crop.Potato]: { ENCHANTED_POTATO: [18, 32, 0, 0], ENCHANTED_BAKED_POTATO: [0, 0, 2, 6] },
	[Crop.Pumpkin]: { ENCHANTED_PUMPKIN: [6, 12, 110, 0], POLISHED_PUMPKIN: [0, 0, 0, 4] },
	[Crop.SugarCane]: { ENCHANTED_SUGAR: [12, 24, 0, 0], ENCHANTED_SUGAR_CANE: [0, 0, 1, 6] },
	[Crop.Melon]: { ENCHANTED_MELON: [24, 48, 0, 0], ENCHANTED_MELON_BLOCK: [0, 0, 4, 12] },
	[Crop.Cactus]: { ENCHANTED_CACTUS_GREEN: [6, 18, 0, 0], ENCHANTED_CACTUS: [0, 0, 1, 6] },
	[Crop.CocoaBeans]: { ENCHANTED_COCOA: [6, 12, 120, 0], ENCHANTED_COOKIE: [0, 0, 0, 4] },
	[Crop.Mushroom]: {
		// The combined mushroom crop assumes equal red/brown harvesting.
		ENCHANTED_BROWN_MUSHROOM: [3, 6, 60, 0],
		ENCHANTED_HUGE_MUSHROOM_1: [0, 0, 0, 8],
		ENCHANTED_RED_MUSHROOM: [3, 6, 60, 0],
		ENCHANTED_HUGE_MUSHROOM_2: [0, 0, 0, 8],
	},
	[Crop.NetherWart]: { ENCHANTED_NETHER_STALK: [18, 36, 0, 0], MUTANT_NETHER_STALK: [0, 0, 2, 6] },
	[Crop.Sunflower]: { ENCHANTED_SUNFLOWER: [12, 24, 0, 0], COMPACTED_SUNFLOWER: [0, 0, 2, 6] },
	[Crop.Moonflower]: { ENCHANTED_MOONFLOWER: [12, 24, 0, 0], COMPACTED_MOONFLOWER: [0, 0, 2, 6] },
	[Crop.WildRose]: { ENCHANTED_WILD_ROSE: [12, 24, 0, 0], COMPACTED_WILD_ROSE: [0, 0, 2, 6] },
};

/** Long-run uptime: a trigger's expected waiting time plus its non-retriggerable active duration. */
export function getCropFeverUptime(level: number, crop: Crop, blocksPerSecond = 20): number {
	if (!Number.isFinite(level) || !Number.isFinite(blocksPerSecond) || blocksPerSecond <= 0) return 0;
	const chance = Math.min(5, Math.max(0, Math.floor(level))) * 0.00001;
	const triggersPerSecond = chance * blocksPerSecond * (CROP_INFO[crop].breaks ?? 1);
	return (DURATION_SECONDS * triggersPerSecond) / (1 + DURATION_SECONDS * triggersPerSecond);
}

/** Average temporary stats and individual bonus items for continuous farming at the given speed. */
export function getCropFeverRateEffects(
	level: number,
	crop: Crop,
	blocksPerSecond = 20,
	options?: PlayerOptions
): Effect[] {
	const rewards = REWARDS[crop];
	if (!rewards) return [];
	const uptime = getCropFeverUptime(level, crop, blocksPerSecond);
	if (uptime <= 0) return [];
	const source = 'Crop Fever';
	const hyperchargeLevel = getChipLevel(getChipInputLevel(options?.chips, 'hypercharge'));
	const hyperchargeMultiplier =
		1 +
		hyperchargeLevel *
			getChipTempMultiplierPerLevel(
				'hypercharge',
				hyperchargeLevel,
				getChipInputRarity(options?.chipRarities, 'hypercharge')
			);
	const rollsPerBreak = uptime * (CROP_INFO[crop].breaks ?? 1);
	return [
		...statsToEffects(
			{ [Stat.FarmingFortune]: 100 * hyperchargeMultiplier * uptime, [Stat.Overbloom]: 15 * uptime },
			source
		),
		...Object.entries(rewards).map(([itemId, amounts]): Effect => ({
			source,
			op: 'add-drop',
			scope: { crops: [crop] },
			drop: {
				itemId,
				output: 'rng',
				baseAmount:
					(rollsPerBreak * (90 * amounts[0] + 40 * amounts[1] + 7 * amounts[2] + amounts[3])) /
					TOTAL_DROP_WEIGHT,
				// Fixed reward rolls are separate from the Overbloom/rare-crop pool.
				tags: [],
				dropKind: 'crop',
			},
		})),
	];
}
