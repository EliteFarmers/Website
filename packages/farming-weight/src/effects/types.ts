import type { Crop } from '../constants/crops.js';
import type { SpecialCrop } from '../constants/specialcrops.js';
import type { Stat } from '../constants/stats.js';

/**
 * Built-in well-known drop tags. Sources can use any string, but built-ins are
 * the auditable set used by the package's own drop entries and effects.
 *
 * - `overbloom`: drop is buffed by Overbloom-class effects (`add-rare-pct` + `mul-rare`).
 * - `rare-crop`: drop is part of the SkyBlock "Rare Crop" pool conceptually.
 * - `special-crop`: drop is a Special Crop (Cropie/Squash/Fermento/Helianthus).
 * - `seasoning`: Harvest Feast Seasoning category.
 * - `feast`: any Harvest Feast drop (seasoning + per-crop materials).
 * - `pest`: drop comes from a pest, not a regular crop break.
 */
export type DropTagBuiltin =
	| 'overbloom'
	| 'rare-crop'
	| 'special-crop'
	| 'seasoning'
	| 'feast'
	| 'pest';

export type DropTag = DropTagBuiltin | (string & {});

/**
 * Minimal player/world environment data needed to collect effects. Constructed
 * exclusively by `buildEffectEnvironment(player, crop?)`.
 */
export interface EffectEnvironment {
	/** Active crop for the rate calc, if any. `undefined` for crop-agnostic stat queries. */
	crop?: Crop;
	/** Harvest Feast active in the world. */
	harvestFeast: boolean;
	/** True only when `crop` is provided AND it is in-season under an active Harvest Feast. */
	inSeason: boolean;
	/** Player is currently on an infested plot (probability > 0). */
	infestedPlot: boolean;
	/** Selected crop from the player's options (used by some shards' force-active rules). */
	selectedCrop?: Crop;
}

/**
 * Drop kinds carried on every candidate drop. Used by `Scope.dropKinds` and
 * for resolver phase routing.
 */
export type DropKind = 'rare' | 'rng' | 'special-crop' | 'pest' | 'crop';

/**
 * Per-drop context built by the resolver during `produce-drops`/`add-rare`/etc.
 * Sources never construct one of these directly.
 */
export interface DropContext {
	env: EffectEnvironment;
	crop: Crop;
	dropKind: DropKind;
	/** Item id of the drop being evaluated, e.g. `'CROPIE'`, `'SEASONING'`, `'WARTY'`. */
	itemId: string;
	specialCropType?: SpecialCrop;
	tags: ReadonlySet<DropTag>;
	/** True iff this drop was produced by an `add-drop` effect this run. */
	fromAddDrop?: boolean;
}

/**
 * Context for stat-shaped queries (`getStat`). Carries no drop fields by design.
 * The stat matcher rejects any scope that uses drop-only fields.
 */
export interface StatContext {
	env: EffectEnvironment;
	/** Optional crop scoping for crop-specific fortunes. */
	crop?: Crop;
}

/**
 * Declarative scope for an effect. Empty scope = global match.
 *
 * Drop-only fields (`items`, `dropKinds`, `specialCropTypes`, `tags`, `match`)
 * cause the stat matcher to reject the effect outright.
 */
export interface Scope {
	crops?: readonly Crop[];
	dropKinds?: readonly DropKind[];
	items?: readonly string[];
	specialCropTypes?: readonly SpecialCrop[];
	/** Match if every listed tag is present on the drop. */
	tags?: readonly DropTag[];
	/** Effect only applies when a Harvest Feast is active in the env. */
	requiresHarvestFeast?: boolean;
	/** Effect only applies when the drop's crop is in-season. */
	requiresInSeason?: boolean;
	/**
	 * If `false`, the effect won't match drops produced by an `add-drop` effect.
	 * Default `true`.
	 */
	appliesToAddedDrops?: boolean;
	/** Predicate escape hatch. Drop-only; never invoked during stat resolution. */
	match?: (ctx: DropContext) => boolean;
}

export type EffectOp =
	| 'add-stat'
	| 'add-rare-pct'
	| 'mul-rare'
	| 'add-drop'
	| 'mul-drop';

export type EffectPhase =
	| 'scalar'
	| 'produce-drops'
	| 'add-rare'
	| 'mul-rare'
	| 'mul-drop';

/** Default phase for each op. Effects rarely override. */
export const DEFAULT_PHASE_FOR_OP: Record<EffectOp, EffectPhase> = {
	'add-stat': 'scalar',
	'add-rare-pct': 'add-rare',
	'mul-rare': 'mul-rare',
	'add-drop': 'produce-drops',
	'mul-drop': 'mul-drop',
};

export interface EffectAddDropPayload {
	itemId: string;
	/** Output bucket for the produced drop. Defaults to `rng`. */
	output?: 'rng' | 'collection' | 'currency';
	/** Optional flat amount per block broken (alternative to `chance`). */
	baseAmount?: number;
	/** Optional 0..1 chance per block broken. */
	chance?: number;
	specialCropType?: SpecialCrop;
	/** Tags assigned to the produced drop. Defaults to `['rare-crop','overbloom']`. */
	tags?: readonly DropTag[];
	/** Drop kind for the produced drop. Defaults to `'rare'`. */
	dropKind?: DropKind;
}

/**
 * Numeric semantics by op (no mixing of factor vs delta within an op):
 *  - `add-stat`:     additive scalar contribution to `stat` (e.g. 5 = +5 Fortune).
 *  - `add-rare-pct`: additive percentage points (e.g. 50 = +50% on rare drops).
 *  - `mul-rare`:     multiplicative factor (e.g. 1.2 = x1.2). Must be >= 0.
 *  - `mul-drop`:     multiplicative factor (e.g. 1.25 = x1.25). Must be >= 0.
 *  - `add-drop`:     `value` is unused; `drop` carries the payload.
 */
export interface Effect {
	source: string;
	op: EffectOp;
	phase?: EffectPhase;
	scope?: Scope;
	stat?: Stat;
	value?: number | ((ctx: DropContext | StatContext) => number);
	drop?: EffectAddDropPayload;
	relatedStats?: readonly Stat[];
	meta?: {
		description?: string;
		valueDisplay?: 'stat' | 'percent' | 'factor';
		valueStat?: Stat;
	};
}

/**
 * Per-drop record of an applied effect, surfaced via `DetailedDropsResult`.
 */
export interface AppliedEffect {
	source: string;
	op: EffectOp;
	phase: EffectPhase;
	/** Resolved numeric contribution at this drop. */
	amount: number;
	relatedStats?: readonly Stat[];
	scope?: Scope;
	description?: string;
	valueDisplay?: 'stat' | 'percent' | 'factor';
	valueStat?: Stat;
}

/**
 * Aggregate per-source totals across the whole rate calc.
 * Replaces today's `rareItemBonusBreakdown`.
 */
export type EffectsBreakdown = Record<string, number>;
