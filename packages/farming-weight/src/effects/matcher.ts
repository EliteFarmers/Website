import type { DropContext, Scope, StatContext } from './types.js';

/**
 * Returns true if `scope` matches the given `DropContext`.
 *
 * Empty scope = global match. All declared fields are AND-ed. The optional
 * `match` predicate runs last.
 */
export function matchesScopeForDrop(scope: Scope | undefined, ctx: DropContext): boolean {
	if (!scope) return true;

	if (scope.crops && !scope.crops.includes(ctx.crop)) return false;
	if (scope.dropKinds && !scope.dropKinds.includes(ctx.dropKind)) return false;
	if (scope.items && !scope.items.includes(ctx.itemId)) return false;
	if (scope.specialCropTypes) {
		if (!ctx.specialCropType) return false;
		if (!scope.specialCropTypes.includes(ctx.specialCropType)) return false;
	}
	if (scope.tags) {
		for (const tag of scope.tags) {
			if (!ctx.tags.has(tag)) return false;
		}
	}
	if (scope.requiresHarvestFeast && !ctx.env.harvestFeast) return false;
	if (scope.requiresInSeason && !ctx.env.inSeason) return false;
	if (scope.appliesToAddedDrops === false && ctx.fromAddDrop) return false;

	if (scope.match && !scope.match(ctx)) return false;

	return true;
}

/**
 * Returns true if `scope` is valid for stat resolution.
 *
 * Drop-only scoped effects never match stat resolution. Any of `items`,
 * `dropKinds`, `specialCropTypes`, `tags`, or `match` causes outright rejection.
 */
export function matchesScopeForStat(scope: Scope | undefined, ctx: StatContext): boolean {
	if (!scope) return true;

	// Drop-only fields disqualify the effect from stat resolution.
	if (scope.items) return false;
	if (scope.dropKinds) return false;
	if (scope.specialCropTypes) return false;
	if (scope.tags) return false;
	if (scope.match) return false;

	if (scope.crops) {
		// A crop-scoped effect contributes to a stat query only when the query
		// names a crop AND that crop is in the scope.
		if (!ctx.crop) return false;
		if (!scope.crops.includes(ctx.crop)) return false;
	}
	if (scope.requiresHarvestFeast && !ctx.env.harvestFeast) return false;
	if (scope.requiresInSeason) {
		// In-season requires a crop and an active feast.
		if (!ctx.crop || !ctx.env.inSeason) return false;
	}

	return true;
}

/**
 * Returns true if `scope` is structurally "global Overbloom-shaped":
 * no crop/feast/season narrowing, optionally `tags: ['overbloom']` only.
 *
 * Used by `getStat(Stat.Overbloom)` to decide which Overbloom-related
 * `add-rare-pct` effects count toward the scalar total.
 */
export function isGlobalOverbloomScope(scope: Scope | undefined): boolean {
	if (!scope) return true;
	if (scope.crops) return false;
	if (scope.dropKinds) return false;
	if (scope.items) return false;
	if (scope.specialCropTypes) return false;
	if (scope.match) return false;
	if (scope.requiresHarvestFeast) return false;
	if (scope.requiresInSeason) return false;
	if (scope.appliesToAddedDrops === false) return false;
	if (scope.tags) {
		// Allow only `['overbloom']` (in any order/length 1).
		if (scope.tags.length !== 1 || scope.tags[0] !== 'overbloom') return false;
	}
	return true;
}
