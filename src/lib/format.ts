import { LEVEL_XP, DEFAULT_SKILL_CAPS, RUNE_LEVELS } from './constants/levels';
import type { Skill } from './skyblock';

function getLevelCap(skill: Skill) {
	return DEFAULT_SKILL_CAPS[skill];
}

export function getSkillLevel(skill: Skill, xp: number, max?: number) {
	let level = 0;

	const cap = max ?? getLevelCap(skill);
	const levels = Object.values(skill !== 'runecrafting' ? LEVEL_XP : RUNE_LEVELS).slice(0, cap);

	for (const xpRequired of levels) {
		if ((xp -= xpRequired) > 0) level++; else {
			xp += xpRequired;
			break;
		}
	}

	return [ level, xp ];
}

export function getLevelProgress(skill: Skill, xp: number, max?: number) {

	const [ level, remainder ] = getSkillLevel(skill, xp, max);

	if ((max && level >= max) || level === getLevelCap(skill)) {
		return {
			level: level,
			ratio: 1,
			progress: remainder
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const nextReq = (LEVEL_XP as any)[level + 1];

	return {
		level: level,
		ratio: (remainder / nextReq),
		progress: remainder,
		goal: nextReq,
		next: level + 1
	}

}

export function toReadable(num: number) {
	if (num >= 1000000000000) return (num / 1000000000000).toFixed(1) + ' T';
	if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' B';
	if (num >= 1000000) return (num / 1000000).toFixed(1) + ' M';
	if (num >= 1000) return (num / 1000).toFixed(1) + ' K';
	return num.toFixed(1);
}