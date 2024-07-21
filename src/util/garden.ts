import { Crop } from "../constants/crops";
import { CROP_MILESTONES, GARDEN_EXP_REQUIRED, GARDEN_VISITORS } from "../constants/garden";
import { Rarity } from "../constants/reforges";
import { getCropFromName } from "./names";

export interface LevelingStats {
	level: number;
	ratio: number;
	progress: number;
	goal?: number;
	next?: number;
	total: number;
}

/**
 * Gets user's current level based on experience 
 * @param exp Current experience/progress
 * @param expRequired Array of the amount of experience required to reach each level, not cumulative 
 * @param maxLevel Maximum level to return
 */
export function getLevel(exp: number, expRequired: number[], maxLevel?: number): LevelingStats {
	let level = 0;
	let xp = exp;
	let maxed = false;

	for (const xpRequired of expRequired) {
		if ((xp -= xpRequired) > 0) {
			level++;

			if (level === maxLevel) {
				maxed = true;
				break;
			}
		} else {
			xp += xpRequired;
			break;
		}
	}

	const nextReq = expRequired[level];

	return {
		total: exp,
		level: level,
		ratio: maxed ? 1 : xp / (nextReq ?? xp),
		progress: xp,
		goal: maxed ? undefined : nextReq,
		next: maxed ? undefined : level + 1,
	};
}

export function getGardenLevel(exp: number): LevelingStats {
	return getLevel(exp, GARDEN_EXP_REQUIRED);
}

export function getCropMilestones(crops: Record<string, number | string>): Record<Crop, LevelingStats> {
	const milestones = {} as Record<string, LevelingStats>;

	for (const [ cropName, collection ] of Object.entries(crops)) {
		const crop = getCropFromName(cropName);
		const col = typeof collection === 'string' ? parseInt(collection) : collection;
		if (isNaN(col) || !crop) continue;

		milestones[crop] = getLevel(col, CROP_MILESTONES[crop]);
	}

	return milestones;
}

export function getCropMilestoneLevels(crops: Record<string, number | string | null | undefined>): Record<Crop, number> {
	const milestones = {} as Record<string, number>;

	for (const [ cropName, collection ] of Object.entries(crops)) {
		const crop = getCropFromName(cropName);
		const col = typeof collection === 'string' ? parseInt(collection) : collection ?? NaN;
		if (isNaN(col) || !crop) continue;

		milestones[crop] = getLevel(col, CROP_MILESTONES[crop]).level;
	}

	return milestones;
}

export function getCropUpgrades(upgrades: Record<string, number>): Record<Crop, number> {
	const cropUpgrades = {} as Record<string, number>;

	for (const [ cropName, upgrade ] of Object.entries(upgrades)) {
		const crop = getCropFromName(cropName);
		if (!crop) continue;

		cropUpgrades[crop] = upgrade;
	}

	return cropUpgrades;
}

export function getGardenVisitor(visitor: string) {
	return GARDEN_VISITORS[visitor];
}

export interface GardenVisitorStats {
	visits: number;
	accepted: number;
}

export interface GardenVisitorStatsWithName extends GardenVisitorStats {
	name: string;
	short?: string;
	rarity: Rarity;
}

export function groupGardenVisitors(visitors: Record<string, GardenVisitorStats>) {
	const groups = {} as Record<Rarity, GardenVisitorStatsWithName[]>;

	for (const [ visitorId, stats ] of Object.entries(visitors)) {
		const visitor = getGardenVisitor(visitorId);
		if (!visitor) continue;

		groups[visitor.rarity] ??= [];
		groups[visitor.rarity].push({
			...visitor,
			...stats,
		});
	}

	for (const group of Object.values(groups)) {
		group.sort((a, b) => {
			if (b.visits === a.visits) {
				if (b.accepted === a.accepted) {
					return a.name.localeCompare(b.name);
				}
				return b.accepted - a.accepted;
			}
			return b.visits - a.visits;
		})
	}

	return groups;
}