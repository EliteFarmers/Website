import type { Stat } from '../constants/stats.js';
import type { EffectSummary } from '../constants/upgrades.js';
import type { Effect } from './types.js';

export function effectToSummary(effect: Effect): EffectSummary | undefined {
	if (!effect.relatedStats || effect.relatedStats.length === 0) return undefined;
	return {
		source: effect.source,
		op: effect.op,
		description: effect.meta?.description,
		relatedStats: effect.relatedStats,
		scope: effect.scope,
		value: typeof effect.value === 'number' ? effect.value : undefined,
		valueDisplay: effect.meta?.valueDisplay,
		valueStat: effect.meta?.valueStat,
	};
}

export function effectsToSummaries(effects: readonly Effect[], stats?: readonly Stat[]): EffectSummary[] {
	const summaries = effects.map(effectToSummary).filter((summary) => summary !== undefined);
	if (!stats || stats.length === 0) return summaries;
	return summaries.filter((summary) => summary.relatedStats?.some((stat) => stats.includes(stat)));
}
