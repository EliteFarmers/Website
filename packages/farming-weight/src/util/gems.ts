import type { Rarity } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import { type EliteItemDto, GemRarity } from '../fortune/item.js';
import { GEMSTONE_SOURCES } from '../items/gems/index.js';
import { gemStat } from '../items/sources/gems.js';

export function getPeridotFortune(rarity: Rarity, item: EliteItemDto) {
	return getGemStat(item, Stat.FarmingFortune, rarity);
}

export function getGemStat(item: EliteItemDto, stat: Stat, rarity: Rarity): number {
	return gemStat(item, stat, rarity);
}

export function getPeridotGems(item: EliteItemDto) {
	const gems = item.gems;
	if (!gems) return [];

	return Object.entries(gems)
		.filter(([gem]) => gem.startsWith('PERIDOT'))
		.map(([, rarity]) => rarity as GemRarity | null);
}

export function getPeridotGemFortune(rarity: Rarity, gem: GemRarity | null): number {
	return GEMSTONE_SOURCES.PERIDOT?.getStat(rarity, gem) ?? 0;
}

export function getNextGemRarity(gem: GemRarity | null) {
	switch (gem) {
		case null:
			return GemRarity.Rough;
		case GemRarity.Rough:
			return GemRarity.Flawed;
		case GemRarity.Flawed:
			return GemRarity.Fine;
		case GemRarity.Fine:
			return GemRarity.Flawless;
		case GemRarity.Flawless:
			return GemRarity.Perfect;
		case GemRarity.Perfect:
			return GemRarity.Perfect;
	}
}

export function getGemRarityName(rarity: GemRarity | null): string {
	switch (rarity) {
		case null:
			return 'None';
		case GemRarity.Rough:
			return 'Rough';
		case GemRarity.Flawed:
			return 'Flawed';
		case GemRarity.Fine:
			return 'Fine';
		case GemRarity.Flawless:
			return 'Flawless';
		case GemRarity.Perfect:
			return 'Perfect';
	}
}
