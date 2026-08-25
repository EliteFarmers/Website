import { describe, expect, it, vi } from 'vitest';
import { Stat } from '../constants/stats.js';
import {
	UpgradeAction,
	UpgradeCategory,
	type FortuneSourceProgress,
	type FortuneUpgrade,
} from '../constants/upgrades.js';
import { setSourceCompletionUpgrades } from './getsourceprogress.js';
import { getProfitCompletionUpgrades, resolveProfitAwareProgress } from './profit-aware-progress.js';

function reforge(title: string, stats: FortuneUpgrade['stats'], special = false): FortuneUpgrade {
	return {
		title,
		action: UpgradeAction.Apply,
		category: UpgradeCategory.Reforge,
		increase: stats?.[Stat.FarmingFortune] ?? 0,
		stats,
		conflictKey: 'item:tool:reforge',
		meta: { type: 'reforge', id: title.toLowerCase().replaceAll(' ', '_'), itemUuid: 'tool' },
		effects: special
			? [{ source: title, op: 'add-rare-pct', relatedStats: [Stat.Overbloom], value: 7 }]
			: undefined,
	};
}

function toolProgress(completionUpgrades: FortuneUpgrade[]): FortuneSourceProgress[] {
	const reforgeProgress: FortuneSourceProgress = {
		name: 'Reforge Stats',
		current: 20,
		max: 20,
		ratio: 1,
		stats: {
			[Stat.FarmingFortune]: { current: 20, max: 21, ratio: 20 / 21 },
			[Stat.Overbloom]: { current: 0, max: 7, ratio: 0 },
		},
	};
	setSourceCompletionUpgrades(reforgeProgress, completionUpgrades);

	return [
		{
			name: 'Farming Tool',
			current: 100,
			max: 107,
			ratio: 100 / 107,
			stats: {
				[Stat.FarmingFortune]: { current: 100, max: 101, ratio: 100 / 101 },
				[Stat.Overbloom]: { current: 0, max: 7, ratio: 0 },
			},
			progress: [reforgeProgress],
		},
	];
}

describe('profit-aware progress', () => {
	it('treats Bountiful as complete when no reforge alternative improves profit', () => {
		const overpriced = reforge('Reforge to Overpriced', { [Stat.FarmingFortune]: -1, [Stat.Overbloom]: 7 }, true);
		const resolved = resolveProfitAwareProgress(toolProgress([overpriced]), () => ({
			complete: true,
			coinsPerHour: -250,
		}));

		expect(resolved[0]?.stats?.[Stat.FarmingFortune]?.max).toBe(100);
		expect(resolved[0]?.stats?.[Stat.Overbloom]).toEqual({ current: 0, max: 0, ratio: 1 });
		expect(resolved[0]?.progress?.[0]?.stats?.[Stat.FarmingFortune]).toEqual({
			current: 20,
			max: 20,
			ratio: 1,
		});
	});

	it('keeps raw progress when the contextual alternative improves profit', () => {
		const overpriced = reforge('Reforge to Overpriced', { [Stat.FarmingFortune]: -1, [Stat.Overbloom]: 7 }, true);
		const original = toolProgress([overpriced]);
		const resolved = resolveProfitAwareProgress(original, () => ({ complete: true, coinsPerHour: 0.02 }));

		expect(resolved[0]?.ratio).toBe(original[0]?.ratio);
		expect(resolved[0]?.stats?.[Stat.Overbloom]?.max).toBe(7);
	});

	it('does not resolve completion until every required valuation is available', () => {
		const overpriced = reforge('Reforge to Overpriced', { [Stat.FarmingFortune]: -1, [Stat.Overbloom]: 7 }, true);
		const resolved = resolveProfitAwareProgress(toolProgress([overpriced]), () => ({
			complete: false,
			coinsPerHour: 0,
		}));

		expect(resolved[0]?.stats?.[Stat.Overbloom]?.max).toBe(7);
	});

	it('evaluates all alternatives in a slot once one has a special rate stat', () => {
		const mossy = reforge('Reforge to Mossy', { [Stat.FarmingFortune]: 8, [Stat.BonusPestChance]: -2 });
		const bustling = reforge('Reforge to Bustling', { [Stat.FarmingFortune]: 4 });
		const compare = vi.fn(() => ({ complete: true, coinsPerHour: -1 }));

		const candidates = getProfitCompletionUpgrades(toolProgress([mossy, bustling]));
		resolveProfitAwareProgress(toolProgress([mossy, bustling]), compare);

		expect(candidates).toEqual([mossy, bustling]);
		expect(compare).toHaveBeenCalledTimes(2);
	});

	it('skips rate comparisons for ordinary stat-only slots', () => {
		const mossy = reforge('Reforge to Mossy', { [Stat.FarmingFortune]: 8 });
		const compare = vi.fn(() => ({ complete: true, coinsPerHour: -1 }));
		const progress = toolProgress([mossy]);

		expect(getProfitCompletionUpgrades(progress)).toEqual([]);
		const resolved = resolveProfitAwareProgress(progress, compare);

		expect(compare).not.toHaveBeenCalled();
		expect(resolved[0]?.stats?.[Stat.Overbloom]?.max).toBe(7);
	});
});
