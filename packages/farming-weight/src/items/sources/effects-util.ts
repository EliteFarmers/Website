import { Stat } from '../../constants/stats.js';
import type { Effect } from '../../effects/types.js';

/**
 * Convert a `Partial<Record<Stat, number>>` to an `Effect[]`. Each non-zero
 * stat becomes an `add-stat` effect, except `Stat.Overbloom` which is rerouted
 * to a global `add-rare-pct` effect with `relatedStats: [Stat.Overbloom]` so
 * the resolver picks it up both as a virtual-stat contribution and as an
 * additive percent on overbloom-tagged drops.
 */
export function statsToEffects(stats: Partial<Record<Stat, number>> | undefined, source: string): Effect[] {
	if (!stats) return [];
	const out: Effect[] = [];
	for (const [statKey, value] of Object.entries(stats) as [Stat, number][]) {
		if (!value) continue;
		if (statKey === Stat.Overbloom) {
			out.push({
				source,
				op: 'add-rare-pct',
				value,
				scope: { tags: ['overbloom'] },
				relatedStats: [Stat.Overbloom],
				meta: {
					description: 'Normal Overbloom',
					valueDisplay: 'stat',
					valueStat: Stat.Overbloom,
				},
			});
			continue;
		}
		out.push({ source, op: 'add-stat', stat: statKey, value });
	}
	return out;
}
