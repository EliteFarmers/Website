import type { Effect, EffectEnvironment } from '../../effects/types.js';
import type { FarmingPlayer } from '../../player/player.js';

/**
 * Result of `getActive` - explains *why* a source is or isn't currently
 * contributing. Used by progress/upgrade UI.
 */
export interface FortuneSourceActiveState {
	active: boolean;
	reason?: string;
	/**
	 * Optional preview fortune number to show when `active === false` (e.g. the
	 * fortune the source *would* contribute if it were active).
	 */
	fortune?: number;
}

/**
 * Base class for any object that can contribute Effects to a calculation.
 *
 * Subclass `getEffects(player, env)` returns the declarative list of effects
 * this source emits in the given environment. The resolver pipeline takes care
 * of scoping, ordering, and aggregation.
 *
 * `getActive` is optional - only override when a source has env-conditional
 * activation (e.g. day/night shards, infested-plot shards).
 */
export abstract class FortuneSource {
	/** Stable id for the source, used as the default `Effect.source`. */
	abstract readonly id: string;
	/** Human-friendly name for breakdowns. */
	abstract readonly name: string;

	abstract getEffects(player: FarmingPlayer, env: EffectEnvironment): Effect[];

	getActive?(player: FarmingPlayer, env: EffectEnvironment): FortuneSourceActiveState;
}
