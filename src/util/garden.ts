import type { Crop } from '../constants/crops.js';
import { CROP_MILESTONES, GARDEN_EXP_REQUIRED, GARDEN_VISITORS } from '../constants/garden.js';
import { GARDEN_PLOT_COSTS, GARDEN_PLOTS, type PlotType } from '../constants/plots.js';
import type { Rarity } from '../constants/reforges.js';
import { getCropFromName } from './names.js';

export interface LevelingStats {
	level: number;
	ratio: number;
	maxed: boolean;
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
 * @param overflow Calculate overflow levels
 */
export function getLevel(exp: number, expRequired: number[], maxLevel?: number, overflow = false): LevelingStats {
	let level = 0;
	let xp = exp;
	let maxed = true;

	for (const xpRequired of expRequired) {
		xp -= xpRequired;
		if (xp > 0) {
			level++;

			if (level === maxLevel) {
				break;
			}
		} else {
			maxed = false;
			xp += xpRequired;
			break;
		}
	}

	const overflowing = !maxLevel && maxed && overflow;

	if (overflowing) {
		const overflowReq = expRequired.at(-1) ?? 0;
		if (overflowReq) {
			const overflowLevels = Math.floor(xp / overflowReq);
			level += overflowLevels;
			xp -= overflowLevels * overflowReq;
		}
	}

	const nextReq = overflowing ? (expRequired.at(-1) ?? 0) : expRequired[level];

	return {
		total: exp,
		level: level,
		maxed: maxed,
		ratio: maxed && !overflowing ? 1 : xp / (nextReq ?? xp),
		progress: xp,
		goal: maxed && !overflowing ? undefined : nextReq,
		next: maxed && !overflowing ? undefined : level + 1,
	};
}

export function getGardenLevel(exp: number, overflow = false): LevelingStats {
	return getLevel(exp, GARDEN_EXP_REQUIRED, undefined, overflow);
}

export function getCropMilestone(crop: Crop, collection: number, overflow = false): LevelingStats {
	return getLevel(collection, CROP_MILESTONES[crop], undefined, overflow);
}

export function getCropMilestones(
	crops: Record<string, number | string>,
	overflow = false
): Record<Crop, LevelingStats> {
	const milestones = {} as Record<string, LevelingStats>;

	for (const [cropName, collection] of Object.entries(crops)) {
		const crop = getCropFromName(cropName);
		const col = typeof collection === 'string' ? parseInt(collection) : collection;
		if (isNaN(col) || !crop) continue;

		milestones[crop] = getLevel(col, CROP_MILESTONES[crop], undefined, overflow);
	}

	return milestones;
}

export function getCropMilestoneLevels(
	crops: Record<string, number | string | null | undefined>,
	overflow = false
): Record<Crop, number> {
	const milestones = {} as Record<string, number>;

	for (const [cropName, collection] of Object.entries(crops)) {
		const crop = getCropFromName(cropName);
		const col = typeof collection === 'string' ? parseInt(collection) : (collection ?? NaN);
		if (isNaN(col) || !crop) continue;

		milestones[crop] = getLevel(col, CROP_MILESTONES[crop], undefined, overflow).level;
	}

	return milestones;
}

export function getCropUpgrades(upgrades: Record<string, number>): Record<Crop, number> {
	const cropUpgrades = {} as Record<string, number>;

	for (const [cropName, upgrade] of Object.entries(upgrades)) {
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

	for (const [visitorId, stats] of Object.entries(visitors)) {
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
		});
	}

	return groups;
}

export function getNextPlotCost(plots: string[]) {
	const unlocked = plots.reduce<Partial<Record<PlotType, number>>>((acc, plot) => {
		const plotData = GARDEN_PLOTS[plot as keyof typeof GARDEN_PLOTS];
		acc[plotData.type] = (acc[plotData.type] ?? 0) + 1;
		return acc;
	}, {});

	for (const [type, count] of Object.entries(GARDEN_PLOT_COSTS)) {
		const plotType = type as PlotType;
		if (unlocked[plotType] === undefined || (unlocked[plotType] ?? 0) < count.length) {
			const nextPlot = Object.entries(GARDEN_PLOTS)
				.filter(([id, plot]) => plot.type === plotType && !plots.includes(id))
				.sort((a, b) => a[1].name.localeCompare(b[1].name))[0];
			return { cost: count[unlocked?.[plotType] ?? 0], plot: nextPlot ? nextPlot[1] : undefined };
		}
	}

	return undefined;
}
