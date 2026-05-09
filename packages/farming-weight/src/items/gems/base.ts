import { GEMSTONES, type GemstoneInfo } from '../../constants/gems.js';
import type { Rarity } from '../../constants/reforge-types.js';
import { Stat } from '../../constants/stats.js';
import type { Effect } from '../../effects/types.js';
import { GemRarity } from '../../fortune/item.js';
import { statsToEffects } from '../sources/effects-util.js';

export class GemstoneSource {
	readonly id: string;
	readonly name: string;
	readonly info: GemstoneInfo;

	constructor(id: string, info: GemstoneInfo) {
		this.id = id;
		this.name = `${titleCase(id)} Gemstone`;
		this.info = info;
	}

	getStat(hostRarity: Rarity, gemRarity: GemRarity | null | undefined): number {
		if (!gemRarity) return 0;
		return this.info.stats[gemRarity]?.[hostRarity] ?? 0;
	}

	getEffects(
		hostRarity: Rarity,
		gemRarity: GemRarity | null | undefined,
		sourceName?: string,
		multiplier = 1
	): Effect[] {
		const value = this.getStat(hostRarity, gemRarity) * multiplier;
		if (!value) return [];

		const rounded = +value.toFixed(2);
		return statsToEffects({ [this.info.stat]: rounded }, sourceName ?? this.name);
	}

	getDeltaEffects(
		hostRarity: Rarity,
		currentGem: GemRarity | null | undefined,
		nextGem: GemRarity | null | undefined,
		sourceName?: string,
		multiplier = 1
	): Effect[] {
		const before = this.getStat(hostRarity, currentGem) * multiplier;
		const after = this.getStat(hostRarity, nextGem) * multiplier;
		const delta = +(after - before).toFixed(2);
		if (!delta) return [];

		return statsToEffects({ [this.info.stat]: delta }, sourceName ?? this.name);
	}
}

export function createGemstoneSources(): Record<string, GemstoneSource> {
	return Object.fromEntries(
		Object.entries(GEMSTONES).map(([id, info]) => [id, new GemstoneSource(id, info)])
	);
}

function titleCase(id: string): string {
	return id
		.toLowerCase()
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

export function getGemstoneIdFromSlot(slot: string): string | undefined {
	const [gemstoneId] = slot.split('_');
	return gemstoneId;
}

export function getGemstoneSourceFromSlot(slot: string): GemstoneSource | undefined {
	const gemstoneId = getGemstoneIdFromSlot(slot);
	if (!gemstoneId) return undefined;
	return GEMSTONE_SOURCES[gemstoneId];
}

export const GEMSTONE_SOURCES = createGemstoneSources();

export function getGemstoneStatFromSlot(
	slot: string,
	gemRarity: GemRarity | null | undefined,
	hostRarity: Rarity,
	stat: Stat
): number {
	const source = getGemstoneSourceFromSlot(slot);
	if (!source || source.info.stat !== stat) return 0;
	return source.getStat(hostRarity, gemRarity);
}
