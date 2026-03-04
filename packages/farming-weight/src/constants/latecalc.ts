import type { Crop } from './crops.js';
import type { LateBreakdownEntry, Stat } from './stats.js';

// Forward declaration to avoid circular imports
// The actual FarmingPlayer type is imported dynamically
export interface LateCalculationPlayerContext {
	fortune: number;
	tempFortune: number;
	permFortune: number;
	pets: unknown[];
	options: unknown;
}

/**
 * Context passed to late calculation callbacks.
 * Late calculation runs after all base stats have been computed,
 * allowing access to the total fortune before late-stage modifiers.
 */
export interface LateCalculationContext {
	/** The player context (if available) */
	player?: LateCalculationPlayerContext;
	/** Total fortune from all base sources (before late calculations) */
	baseFortune: number;
	/** The stat being calculated */
	stat: Stat;
	/** The target crop (if calculating crop-specific fortune) */
	crop?: Crop;
}

/**
 * Result from a late calculation callback.
 * Can provide additive fortune, a multiplier, or both.
 */
export interface LateCalculationResult {
	/**
	 * Additive fortune to add to the total.
	 * For reductions, use negative values.
	 */
	additive?: number;

	/**
	 * Multiplier to apply to the total fortune.
	 * 1.0 = no change, 0.25 = 25% of original (75% reduction).
	 * If not specified, defaults to 1.0.
	 */
	multiplier?: number;

	/**
	 * Breakdown entries for display.
	 * Each entry shows the final value (after applying the multiplier/additive)
	 * and optionally includes the factor for frontend display.
	 */
	breakdown?: Record<string, LateBreakdownEntry>;
}
