import { Stat } from '../../constants/stats.js';
import type { EffectSummary } from '../../constants/upgrades.js';
import { effectsToSummaries } from '../../effects/summary.js';
import type { Effect } from '../../effects/types.js';
import { GemRarity, type EliteItemDto } from '../../fortune/item.js';
import type { Rarity } from '../../constants/reforge-types.js';
import { getGemstoneSourceFromSlot, getGemstoneStatFromSlot } from '../gems/index.js';

export function gemStat(item: EliteItemDto, stat: Stat, hostRarity: Rarity): number {
	const gems = item.gems;
	if (!gems) return 0;

	let sum = 0;
	for (const [slot, gemRarity] of Object.entries(gems)) {
		sum += getGemstoneStatFromSlot(slot, gemRarity as GemRarity | null, hostRarity, stat);
	}
	return sum;
}

export function gemEffects(
	item: EliteItemDto,
	hostRarity: Rarity,
	sourceName: string,
	multiplier = 1
): Effect[] {
	const gems = item.gems;
	if (!gems) return [];

	const effects: Effect[] = [];
	for (const [slot, gemRarity] of Object.entries(gems)) {
		const source = getGemstoneSourceFromSlot(slot);
		if (!source) continue;
		effects.push(...source.getEffects(hostRarity, gemRarity as GemRarity | null, sourceName, multiplier));
	}
	return effects;
}

export function gemSlotDeltaEffects(
	slot: string,
	hostRarity: Rarity,
	currentGem: GemRarity | null | undefined,
	nextGem: GemRarity | null | undefined,
	sourceName: string,
	multiplier = 1
): Effect[] {
	const source = getGemstoneSourceFromSlot(slot);
	if (!source) return [];

	return source.getDeltaEffects(hostRarity, currentGem, nextGem, sourceName, multiplier);
}

export function gemSlotDeltaEffectSummaries(
	slot: string,
	hostRarity: Rarity,
	currentGem: GemRarity | null | undefined,
	nextGem: GemRarity | null | undefined,
	sourceName: string,
	stats?: Stat[],
	multiplier = 1
): EffectSummary[] {
	return effectsToSummaries(gemSlotDeltaEffects(slot, hostRarity, currentGem, nextGem, sourceName, multiplier), stats);
}
