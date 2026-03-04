import { GEMSTONES } from '../constants/gems.js';
import type { Rarity } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import { type EliteItemDto, GemRarity } from '../fortune/item.js';

export function getPeridotFortune(rarity: Rarity, item: EliteItemDto) {
	return getGemStat(item, Stat.FarmingFortune, rarity);
}

export function getGemStat(item: EliteItemDto, stat: Stat, rarity: Rarity): number {
	const gems = item.gems;
	if (!gems) return 0;

	let sum = 0;

	for (const [slot, gemRarity] of Object.entries(gems)) {
		if (!gemRarity) continue;

		// Slot format: GEM_TYPE_INDEX (e.g., RUBY_0, PERIDOT_1)
		const parts = slot.split('_');
		const gemType = parts[0];
		if (!gemType) continue;

		const gemstoneInfo = GEMSTONES[gemType];
		if (!gemstoneInfo) continue;

		if (gemstoneInfo.stat !== stat) continue;

		const rarityStats = gemstoneInfo.stats[gemRarity as GemRarity];
		if (!rarityStats) continue;

		const value = rarityStats[rarity];
		if (value) {
			sum += value;
		}
	}

	return sum;
}

export function getPeridotGems(item: EliteItemDto) {
	const gems = item.gems;
	if (!gems) return [];

	return Object.entries(gems)
		.filter(([gem]) => gem.startsWith('PERIDOT'))
		.map(([, rarity]) => rarity as GemRarity | null);
}

export function getPeridotGemFortune(rarity: Rarity, gem: GemRarity | null): number {
	if (!gem) return 0;
	return GEMSTONES['PERIDOT']?.stats[gem]?.[rarity] ?? 0;
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
