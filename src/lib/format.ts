import { RANKS, RANK_PLUS_COLORS } from './constants/data';
import { LEVEL_XP, DEFAULT_SKILL_CAPS, RUNE_LEVELS, SOCIAL_XP } from './constants/levels';
import type { RankName, Skill, PlusColor } from './skyblock';

function getLevelCap(skill: Skill) {
	return DEFAULT_SKILL_CAPS[skill];
}

export function getSkillLevel(skill: Skill, xp: number, max?: number) {
	let level = 0;

	const cap = max ?? getLevelCap(skill);

	let XP_CHART = LEVEL_XP as Record<number, number>;
	if (skill === 'runecrafting') {
		XP_CHART = RUNE_LEVELS;
	} else if (skill === 'social') {
		XP_CHART = SOCIAL_XP;
	}

	const levels = Object.values(XP_CHART).slice(0, cap);

	for (const xpRequired of levels) {
		if ((xp -= xpRequired) > 0) level++;
		else {
			xp += xpRequired;
			break;
		}
	}

	return [level, xp];
}

export function getLevelProgress(skill: Skill, xp: number, max?: number) {
	const [level, remainder] = getSkillLevel(skill, xp, max);

	if ((max && level >= max) || level === getLevelCap(skill)) {
		return {
			level: level,
			ratio: 1,
			progress: remainder,
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const nextReq = (LEVEL_XP as Record<number, number>)[level + 1];

	return {
		level: level,
		ratio: remainder / nextReq,
		progress: remainder,
		goal: nextReq,
		next: level + 1,
	};
}

export function toReadable(num: number) {
	if (num >= 1000000000000) return (num / 1000000000000).toFixed(1) + ' T';
	if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' B';
	if (num >= 1000000) return (num / 1000000).toFixed(1) + ' M';
	if (num >= 1000) return (num / 1000).toFixed(1) + ' K';
	return num.toFixed(1);
}

/**
 *
 * Converts a skyblock date to unix seconds.
 *
 * @param  {number} sbYear
 * @param  {number} sbMonth
 * @param  {number} sbDay
 * @returns Date
 */
export function getTimeStamp(sbYear: number, sbMonth: number, sbDay: number): number {
	// SkyBlock epoch is 2019/06/11
	const epochSeconds = 1560275700;

	// Total skyblock days passed since epoch
	const totalDays = sbYear * 372 + sbMonth * 31 + sbDay;

	// Convert skyblock days to real life time
	const realLifeSeconds = totalDays * 20 * 60;

	// Convert real life time to unix time
	const unixTime = epochSeconds + realLifeSeconds;

	// Convert unix time to date object
	return unixTime;
}
/**
 *
 * Converts a skyblock contest key string to unix seconds.
 *
 * @param  {string} contestKey
 */
export function getContestTimeStamp(contestKey: string) {
	// contest keys are in this format: '160:6_30:NETHER_STALK'
	// Parse the date and time from the contest key
	const split = contestKey.split(':');
	const skyblockYear = +split[0];
	const skyblockMonth = +split[1].split('_')[0];
	const skyblockDay = +split[1].split('_')[1];

	return getTimeStamp(skyblockYear, skyblockMonth, skyblockDay);
}

export function getRankDefaults(rank?: RankName) {
	if (!rank) return undefined;

	return RANKS[rank];
}

export function convertPlusColorToHex(color?: PlusColor) {
	if (!color) return undefined;

	return RANK_PLUS_COLORS[color];
}
