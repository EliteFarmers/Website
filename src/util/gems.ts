import { PERIDOT } from '../constants/gems.js';
import { Rarity } from '../constants/reforges.js';
import { EliteItemDto, GemRarity } from '../fortune/item.js';

export function getPeridotFortune(rarity: Rarity, item: EliteItemDto) {
	const gems = item.gems;
	if (!gems) return 0;

	const peridot = PERIDOT[rarity];
	if (!peridot) return 0;

	return Object.entries(gems)
		.filter(([gem, value]) => gem.startsWith('PERIDOT') && value !== null)
		.reduce((acc, gem) => acc + peridot[gem[1] as GemRarity], 0);
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
	return PERIDOT[rarity]?.[gem] ?? 0;
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
