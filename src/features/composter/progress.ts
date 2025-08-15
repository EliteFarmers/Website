import { mergeCost, UpgradeAction, UpgradeCategory, type UpgradeCost } from '../../constants/upgrades.js';
import { getUpgradeSourceProgress } from '../../upgrades/getsourceprogress.js';
import type { DynamicUpgradeSource } from '../../upgrades/sources/dynamicfortunesources.js';
import type { ComposterUpgrade } from './composter.js';
import { COMPOSTER_UPGRADES } from './upgrades.js';

type Result = Record<ComposterUpgrade, number>;
type Input = {
	levels: Partial<Record<ComposterUpgrade, number>>;
	stats: Result;
};

export function getComposterStats(upgradeLevels: Partial<Record<ComposterUpgrade, number>>) {
	const result = {} as Record<ComposterUpgrade, number>;

	return {
		progress: getUpgradeSourceProgress<Input, number>(
			{ levels: upgradeLevels, stats: result },
			COMPOSTER_UPGRADE_SOURCES
		),
		stats: result,
		costToMax: Object.entries(COMPOSTER_UPGRADES).reduce(
			(acc, [key, upgrade]) => {
				const level = upgradeLevels[key as ComposterUpgrade] ?? 0;
				if (level >= upgrade.levels.length) return acc;
				acc[key as ComposterUpgrade] = mergeCost(...upgrade.levels.slice(level));
				return acc;
			},
			{} as Record<ComposterUpgrade, UpgradeCost>
		),
	};
}

export const COMPOSTER_UPGRADE_SOURCES: DynamicUpgradeSource<Input, number>[] = [
	...Object.entries(COMPOSTER_UPGRADES).map(([k, upgrade]) => {
		const key = k as ComposterUpgrade;
		const result: DynamicUpgradeSource<Input, number> = {
			name: upgrade.name,
			key: key,
			exists: () => true,
			wiki: () => upgrade.wiki,
			max: () => upgrade.current(upgrade.levels.length),
			current: ({ levels, stats }) => {
				const result = upgrade.current(levels[key] ?? 0);
				stats[key] = result;
				return result;
			},
			progress: ({ levels }) => {
				const current = levels[key] ?? 0;
				return {
					name: upgrade.name,
					current: current,
					max: 25,
					ratio: current > 0 ? current / 25 : 0,
					perLevel: 1,
				};
			},
			upgrades: ({ levels }) => {
				const nextLevel = (levels[key] ?? 0) + 1;
				if (nextLevel > upgrade.levels.length) return [];
				const current = upgrade.current(levels[key] ?? 0);
				return [
					{
						title: upgrade.name + ' ' + nextLevel,
						current: current,
						increase: upgrade.current(nextLevel) - current,
						action: UpgradeAction.LevelUp,
						category: UpgradeCategory.Composter,
						cost: upgrade.levels[nextLevel - 1],
					},
				];
			},
		};

		return result;
	}),
];
