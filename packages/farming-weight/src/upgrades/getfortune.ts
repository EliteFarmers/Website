import { Stat } from '../constants/stats.js';
import type { FortuneSource } from '../constants/upgrades.js';

export function getFortune(level: number | null | undefined, source: FortuneSource, stat: Stat = Stat.FarmingFortune) {
	const lvl = Math.min(Math.max(level ?? 0, 0), source.maxLevel);
	if (stat === Stat.FarmingFortune) {
		return lvl * source.fortunePerLevel;
	}

	return lvl * (source.statsPerLevel?.[stat] ?? 0);
}
