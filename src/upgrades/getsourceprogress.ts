import type { FortuneSourceProgress } from '../constants/upgrades.js';
import type {
	DynamicFortuneSource,
	DynamicUpgradeSource,
	UpgradeSourceProgress,
} from './sources/dynamicfortunesources.js';

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
			ratio: Math.min(isNaN(current / max) ? 0 : current / max, 1),
		} as FortuneSourceProgress;

		if (source.progress) {
			const p = source.progress(upgradeable);
			if (p) {
				progress.progress = p;
			}
		}

		if (source.active) {
			progress.active = source.active(upgradeable);
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
