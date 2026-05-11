import type { Stat } from '../constants/stats.js';
import { isGlobalOverbloomScope, matchesScopeForDrop, matchesScopeForStat } from './matcher.js';
import {
	type AppliedEffect,
	DEFAULT_PHASE_FOR_OP,
	type DropContext,
	type Effect,
	type EffectAddDropPayload,
	type EffectEnvironment,
	type EffectPhase,
	type StatContext,
} from './types.js';

/** Resolve an effect's phase, defaulting from its op when omitted. */
export function effectPhase(effect: Effect): EffectPhase {
	return effect.phase ?? DEFAULT_PHASE_FOR_OP[effect.op];
}

/** Resolve the numeric `value` of an effect at a given context. */
function resolveValue(effect: Effect, ctx: DropContext | StatContext): number {
	const { value } = effect;
	if (typeof value === 'function') return value(ctx);
	return typeof value === 'number' ? value : 0;
}

/**
 * Throw if a multiplicative effect carries an invalid value. Catches the
 * Cropeetle/Deep-Fried delta-vs-factor mismatch class of bugs at the source.
 */
export function assertValidEffect(effect: Effect): void {
	if (effect.op === 'mul-rare' || effect.op === 'mul-drop') {
		const v = effect.value;
		const numeric = typeof v === 'number' ? v : null;
		if (numeric !== null && numeric < 0) {
			throw new Error(
				`Invalid ${effect.op} effect from "${effect.source}": value must be >= 0 (got ${numeric}). ` +
					'Multiplicative ops carry a factor (1.2 = x1.2), not a delta.'
			);
		}
	}
	if (effect.op === 'add-stat' && !effect.stat) {
		throw new Error(`Invalid add-stat effect from "${effect.source}": missing 'stat' field.`);
	}
	if (effect.op === 'add-drop' && !effect.drop) {
		throw new Error(`Invalid add-drop effect from "${effect.source}": missing 'drop' field.`);
	}
}

/**
 * Sum `add-stat` effects matching a stat query and a `StatContext`.
 *
 * Drop-only scoped effects are rejected by the matcher.
 */
export function resolveStatTotal(effects: readonly Effect[], stat: Stat, ctx: StatContext): number {
	let total = 0;
	for (const effect of effects) {
		if (effect.op !== 'add-stat') continue;
		if (effect.stat !== stat) continue;
		if (!matchesScopeForStat(effect.scope, ctx)) continue;
		total += resolveValue(effect, ctx);
	}
	return total;
}

/**
 * Per-stat breakdown of `add-stat` contributions matching a `StatContext`.
 * Returns `{ source: amount }` aggregated by source name.
 */
export function resolveStatBreakdown(effects: readonly Effect[], stat: Stat, ctx: StatContext): Record<string, number> {
	const out: Record<string, number> = {};
	for (const effect of effects) {
		if (effect.op !== 'add-stat') continue;
		if (effect.stat !== stat) continue;
		if (!matchesScopeForStat(effect.scope, ctx)) continue;
		const v = resolveValue(effect, ctx);
		if (!v) continue;
		out[effect.source] = (out[effect.source] ?? 0) + v;
	}
	return out;
}

/**
 * Compute the virtual scalar for `Stat.Overbloom`.
 *
 * Sums `value` from `add-rare-pct` effects whose `relatedStats` includes
 * `Stat.Overbloom` and whose scope is global Overbloom-shaped. Scoped Overbloom-
 * flavored effects are excluded by design - see the architecture plan.
 */
export function resolveOverbloomScalar(effects: readonly Effect[], ctx: StatContext, overbloomStat: Stat): number {
	let total = 0;
	for (const effect of effects) {
		if (effect.op !== 'add-rare-pct') continue;
		if (!effect.relatedStats?.includes(overbloomStat)) continue;
		if (!isGlobalOverbloomScope(effect.scope)) continue;
		// Env-level requirements still apply to the scalar (e.g. Harvest Feast-only flat Overbloom would only
		// contribute when the feast is active). `requiresInSeason` requires a crop in the StatContext.
		if (effect.scope?.requiresHarvestFeast && !ctx.env.harvestFeast) continue;
		if (effect.scope?.requiresInSeason && (!ctx.crop || !ctx.env.inSeason)) continue;
		total += resolveValue(effect, ctx);
	}
	return total;
}

/**
 * Per-source breakdown of the global Overbloom scalar.
 */
export function resolveOverbloomBreakdown(
	effects: readonly Effect[],
	ctx: StatContext,
	overbloomStat: Stat
): Record<string, number> {
	const out: Record<string, number> = {};
	for (const effect of effects) {
		if (effect.op !== 'add-rare-pct') continue;
		if (!effect.relatedStats?.includes(overbloomStat)) continue;
		if (!isGlobalOverbloomScope(effect.scope)) continue;
		if (effect.scope?.requiresHarvestFeast && !ctx.env.harvestFeast) continue;
		if (effect.scope?.requiresInSeason && (!ctx.crop || !ctx.env.inSeason)) continue;
		const v = resolveValue(effect, ctx);
		if (!v) continue;
		out[effect.source] = (out[effect.source] ?? 0) + v;
	}
	return out;
}

export interface ProducedDrop {
	source: string;
	payload: EffectAddDropPayload;
}

/**
 * Collect drops emitted by `add-drop` effects whose env-level scope matches.
 *
 * Real per-drop scope filtering (tags, items, etc.) happens later when the
 * calculator builds a `DropContext` for each candidate.
 */
export function produceAddedDrops(effects: readonly Effect[], env: EffectEnvironment): ProducedDrop[] {
	const out: ProducedDrop[] = [];
	for (const effect of effects) {
		if (effect.op !== 'add-drop') continue;
		if (!effect.drop) continue;
		const scope = effect.scope;
		if (scope) {
			if (scope.crops) {
				if (!env.crop) continue;
				if (!scope.crops.includes(env.crop)) continue;
			}
			if (scope.requiresHarvestFeast && !env.harvestFeast) continue;
			if (scope.requiresInSeason && !env.inSeason) continue;
		}
		out.push({ source: effect.source, payload: effect.drop });
	}
	return out;
}

export interface DropResolutionResult {
	/** Additive percentage points (e.g. 50 = +50%) summed from `add-rare-pct` effects. */
	addRarePct: number;
	/** Combined `mul-rare` factor (product of all matching factors). 1.0 = identity. */
	mulRare: number;
	/** Combined `mul-drop` factor (product of all matching factors). 1.0 = identity. */
	mulDrop: number;
	/** Per-effect record of contributions to this drop, in pipeline order. */
	applied: AppliedEffect[];
}

/**
 * Resolve `add-rare-pct`, `mul-rare`, and `mul-drop` effects for a single drop.
 *
 * The calculator is expected to combine the parts as:
 *   `final = base * (1 + addRarePct/100) * mulRare * mulDrop`
 *
 * `applied` records every effect that touched this drop, with phase and
 * resolved amount, for breakdown UIs.
 */
export function resolveDropEffects(effects: readonly Effect[], ctx: DropContext): DropResolutionResult {
	let addRarePct = 0;
	let mulRare = 1;
	let mulDrop = 1;
	const applied: AppliedEffect[] = [];

	// Phase: add-rare
	for (const effect of effects) {
		if (effect.op !== 'add-rare-pct') continue;
		if (!matchesScopeForDrop(effect.scope, ctx)) continue;
		const v = resolveValue(effect, ctx);
		if (!v) continue;
		addRarePct += v;
		applied.push({
			source: effect.source,
			op: effect.op,
			phase: 'add-rare',
			amount: v,
			relatedStats: effect.relatedStats,
			scope: effect.scope,
			description: effect.meta?.description,
			valueDisplay: effect.meta?.valueDisplay,
			valueStat: effect.meta?.valueStat,
		});
	}

	// Phase: mul-rare
	for (const effect of effects) {
		if (effect.op !== 'mul-rare') continue;
		if (!matchesScopeForDrop(effect.scope, ctx)) continue;
		const v = resolveValue(effect, ctx);
		if (v < 0) {
			throw new Error(`Invalid mul-rare value ${v} from "${effect.source}" (must be >= 0; factor semantics).`);
		}
		if (v === 1) continue;
		mulRare *= v;
		applied.push({
			source: effect.source,
			op: effect.op,
			phase: 'mul-rare',
			amount: v,
			relatedStats: effect.relatedStats,
			scope: effect.scope,
			description: effect.meta?.description,
			valueDisplay: effect.meta?.valueDisplay,
			valueStat: effect.meta?.valueStat,
		});
	}

	// Phase: mul-drop
	for (const effect of effects) {
		if (effect.op !== 'mul-drop') continue;
		if (!matchesScopeForDrop(effect.scope, ctx)) continue;
		const v = resolveValue(effect, ctx);
		if (v < 0) {
			throw new Error(`Invalid mul-drop value ${v} from "${effect.source}" (must be >= 0; factor semantics).`);
		}
		if (v === 1) continue;
		mulDrop *= v;
		applied.push({
			source: effect.source,
			op: effect.op,
			phase: 'mul-drop',
			amount: v,
			relatedStats: effect.relatedStats,
			scope: effect.scope,
			description: effect.meta?.description,
			valueDisplay: effect.meta?.valueDisplay,
			valueStat: effect.meta?.valueStat,
		});
	}

	return { addRarePct, mulRare, mulDrop, applied };
}
