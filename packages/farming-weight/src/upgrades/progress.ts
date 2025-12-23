import type { FortuneSource, FortuneSourceProgress } from '../constants/upgrades.js';
import type { Upgradeable } from '../fortune/upgradeable.js';
import { getFortune } from './getfortune.js';

export function getFortuneProgress(level: number | null | undefined, source: FortuneSource): FortuneSourceProgress {
	return {
		name: source.name,
		maxLevel: source.maxLevel,
		fortunePerLevel: source.fortunePerLevel,
		wiki: source.wiki,
		current: getFortune(level, source),
		ratio: Math.min((level ?? 0) / source.maxLevel, 1),
		max: source.maxLevel * source.fortunePerLevel,
		upgrades: [],
	};
}

export function getItemProgress(item: Upgradeable): FortuneSourceProgress {
	const info = item.info;
	const upgrades = item.getUpgrades();

	return {
		name: item.item.name ?? item.item.skyblockId ?? 'Unknown Item',
		current: item.fortune,
		ratio: 0,
		maxLevel: 0,
		fortunePerLevel: 0,
		max: 0,
		wiki: info.wiki,
		upgrades: upgrades,
	};
}
