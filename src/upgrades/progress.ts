import { FortuneSource, FortuneSourceProgress } from '../constants/upgrades.js';
import { Upgradeable } from '../fortune/upgradeable.js';
import { getFortune } from './upgrades.js';

export function getFortuneProgress(level: number | null | undefined, source: FortuneSource): FortuneSourceProgress {
	return {
		name: source.name,
		maxLevel: source.maxLevel,
		fortunePerLevel: source.fortunePerLevel,
		wiki: source.wiki,
		fortune: getFortune(level, source),
		ratio: Math.min((level ?? 0) / source.maxLevel, 1),
		maxFortune: source.maxLevel * source.fortunePerLevel,
		upgrades: [],
	};
}

export function getItemProgress(item: Upgradeable): FortuneSourceProgress {
	const info = item.info;
	const upgrades = item.getUpgrades();

	return {
		name: item.item.name ?? item.item.skyblockId ?? 'Unknown Item',
		fortune: item.fortune,
		ratio: 0,
		maxLevel: 0,
		fortunePerLevel: 0,
		maxFortune: 0,
		wiki: info.wiki,
		upgrades: upgrades,
	};
}
