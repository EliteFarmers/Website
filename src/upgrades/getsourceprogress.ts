import { Stat } from '../constants/stats.js';
import type { FortuneSourceProgress } from '../constants/upgrades.js';
import type {
	DynamicFortuneSource,
	DynamicUpgradeSource,
	UpgradeSourceProgress,
} from './sources/dynamicfortunesources.js';

export function getSourceProgress<T extends object>(
	upgradeable: T,
	sources: DynamicFortuneSource<T>[],
	zeroed = false,
	stats?: Stat[]
): FortuneSourceProgress[] {
	const result = [] as FortuneSourceProgress[];

	// Ensure the item fortune is up to date
	if ('getFortune' in upgradeable && typeof upgradeable.getFortune === 'function') {
		upgradeable.getFortune();
	}

	for (const source of sources) {
		if (!source.exists(upgradeable)) continue;

		const max = source.max(upgradeable);
		const current = zeroed ? 0 : source.current(upgradeable);

		const progress = {
			name: source.name,
			fortune: current,
			maxFortune: max,
			ratio: Math.min(isNaN(current / max) ? 0 : current / max, 1),
		} as FortuneSourceProgress;

		// Per-stat progress (optional; only when explicitly requested)
		if (stats && stats.length > 0) {
			const perStat: NonNullable<FortuneSourceProgress['stats']> = {};
			for (const stat of stats) {
				const maxForStat = source.maxStat
					? source.maxStat(upgradeable, stat)
					: stat === Stat.FarmingFortune
						? max
						: 0;
				const currentForStat = zeroed
					? 0
					: source.currentStat
						? source.currentStat(upgradeable, stat)
						: stat === Stat.FarmingFortune
							? current
							: 0;
				if (maxForStat !== 0 || currentForStat !== 0) {
					perStat[stat] = {
						current: currentForStat,
						max: maxForStat,
						ratio: Math.min(isNaN(currentForStat / maxForStat) ? 0 : currentForStat / maxForStat, 1),
					};
				}
			}
			if (Object.keys(perStat).length > 0) {
				progress.stats = perStat;
			}
		}

		if (source.progress) {
			const p = source.progress(upgradeable, stats);
			if (p) {
				progress.progress = p;
			}
		}

		if (source.active) {
			progress.active = source.active(upgradeable);
			// If we also have stat-aware active, attach values for requested stats
			if (source.activeStat && stats && stats.length > 0) {
				const activeStats: Partial<Record<Stat, number>> = {};
				for (const stat of stats) {
					const a = source.activeStat(upgradeable, stat);
					if (a.value !== undefined) activeStats[stat] = a.value;
				}
				if (Object.keys(activeStats).length > 0) {
					progress.active.stats = activeStats;
				}
			}
		}

		if (source.info) {
			const { item, info, maxInfo, nextInfo } = source.info(upgradeable);
			if (item) progress.item = item;
			if (info) progress.info = info;
			if (maxInfo) progress.maxInfo = maxInfo;
			if (nextInfo) progress.nextInfo = nextInfo;
		}

		if (source.wiki) {
			const wiki = source.wiki(upgradeable);
			if (wiki) progress.wiki = wiki;
		}

		if (source.api === false) {
			progress.api = false;
		}

		if (source.upgrades) {
			const upgrades = source.upgrades(upgradeable, stats);
			for (const upgrade of upgrades) {
				upgrade.max = upgrade.max ?? max;
				upgrade.wiki = upgrade.wiki ?? progress.wiki;
			}
			if (upgrades.length > 0) {
				progress.upgrades = upgrades;
			}
		}

		// Keep legacy progress output clean: skip sources that contribute nothing
		// (but preserve stat-aware or upgrade-bearing sources).
		if (
			progress.maxFortune === 0 &&
			progress.fortune === 0 &&
			!progress.stats &&
			!progress.upgrades &&
			!progress.progress
		) {
			continue;
		}

		result.push(progress);
	}

	return result;
}

export function getUpgradeSourceProgress<Input, Output>(
	input: Input,
	sources: DynamicUpgradeSource<Input, Output>[]
): UpgradeSourceProgress<Output>[] {
	const result = [] as UpgradeSourceProgress<Output>[];

	// Use optional input initialization
	if (input && typeof input === 'object' && 'init' in input && typeof input.init === 'function') {
		input.init();
	}

	for (const source of sources) {
		if (!source.exists(input)) continue;

		source.current(input); // Call to make sure any side effects are applied

		const max = source.max(input);
		const progress = source.progress(input);

		if (source.key) {
			if (typeof source.key === 'function') {
				progress.key = source.key(input);
			} else {
				progress.key = source.key;
			}
		}

		if (source.active) {
			progress.active = source.active(input);
		}

		if (source.info) {
			const { item, info, maxInfo, nextInfo } = source.info(input);
			if (item) progress.item = item;
			if (info) progress.info = info;
			if (maxInfo) progress.maxInfo = maxInfo;
			if (nextInfo) progress.nextInfo = nextInfo;
		}

		if (source.wiki) {
			const wiki = source.wiki(input);
			if (wiki) progress.wiki = wiki;
		}

		if (source.api === false) {
			progress.api = false;
		}

		if (source.upgrades) {
			const upgrades = source.upgrades(input);
			for (const upgrade of upgrades) {
				upgrade.max = upgrade.max ?? max;
				upgrade.wiki = upgrade.wiki ?? progress.wiki;
			}
			if (upgrades.length > 0) {
				progress.upgrades = upgrades;
			}
		}

		result.push(progress);
	}

	return result;
}
