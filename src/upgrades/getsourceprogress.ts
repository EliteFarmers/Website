import type { FortuneSourceProgress } from '../constants/upgrades.js';
import type { DynamicFortuneSource } from './sources/toolsources.js';

export function getSourceProgress<T extends object>(
	upgradeable: T,
	sources: DynamicFortuneSource<T>[],
	zeroed = false
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
			ratio: Math.min(current / max, 1),
		} as FortuneSourceProgress;

		if (source.progress) {
			const p = source.progress(upgradeable);
			if (p) {
				progress.progress = p;
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
			const upgrades = source.upgrades(upgradeable);
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
