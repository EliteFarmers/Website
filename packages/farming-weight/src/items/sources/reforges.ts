import type { Rarity } from '../../constants/reforge-types.js';
import type { Effect } from '../../effects/types.js';
import { REFORGE_SOURCES } from '../reforges/index.js';

/**
 * Compatibility helper for callers that only need the effects for a reforge id
 * at a host item rarity. Reforge behavior now lives on the class-backed
 * registry under `items/reforges/`.
 */
export function reforgeEffects(reforgeId: string, rarity: Rarity, sourceName?: string): Effect[] {
	return REFORGE_SOURCES[reforgeId]?.getEffects(rarity, sourceName) ?? [];
}
