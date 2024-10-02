import { Rarity } from '../constants/reforges';

export function getRarityFromLore(lore: string[]) {
	const line = lore.at(-1);
	const found = getRarity(line ?? '', undefined);
	if (found) {
		return found;
	}
	
	// Lore gets jumbled up sometimes? So this is a backup
	for (const line of lore) {
		const found = getRarity(line ?? '', undefined);
		if (found) return found;
	}

	return Rarity.Common;
}

function getRarity<T = Rarity>(line: string, fallback?: T): Rarity | T {
	switch (true) {
		case line.includes('COMMON'):
			return Rarity.Common;
		case line.includes('UNCOMMON'):
			return Rarity.Uncommon;
		case line.includes('RARE'):
			return Rarity.Rare;
		case line.includes('EPIC'):
			return Rarity.Epic;
		case line.includes('LEGENDARY'):
			return Rarity.Legendary;
		case line.includes('MYTHIC'):
			return Rarity.Mythic;
		case line.includes('DIVINE'):
			return Rarity.Divine;
		case line.includes('SPECIAL'):
			return Rarity.Special;
		case line.includes('VERY SPECIAL'):
			return Rarity.VerySpecial;
		case line.includes('ULTIMATE'):
			return Rarity.Ultimate;
		case line.includes('ADMIN'):
			return Rarity.Admin;
		default:
			return fallback ?? Rarity.Common;
	}
}

export function nextRarity(rarity: Rarity): Rarity {
	switch (rarity) {
		case Rarity.Common:
			return Rarity.Uncommon;
		case Rarity.Uncommon:
			return Rarity.Rare;
		case Rarity.Rare:
			return Rarity.Epic;
		case Rarity.Epic:
			return Rarity.Legendary;
		case Rarity.Legendary:
			return Rarity.Mythic;
		case Rarity.Mythic:
			return Rarity.Divine;
		case Rarity.Divine:
			return Rarity.Special;
		case Rarity.Special:
			return Rarity.VerySpecial;
		default:
			return rarity;
	}
}

export function previousRarity(rarity: Rarity): Rarity {
	switch (rarity) {
		case Rarity.Common:
			return Rarity.Common;
		case Rarity.Uncommon:
			return Rarity.Common;
		case Rarity.Rare:
			return Rarity.Uncommon;
		case Rarity.Epic:
			return Rarity.Rare;
		case Rarity.Legendary:
			return Rarity.Epic;
		case Rarity.Mythic:
			return Rarity.Legendary;
		case Rarity.Divine:
			return Rarity.Mythic;
		case Rarity.Special:
			return Rarity.Divine;
		case Rarity.VerySpecial:
			return Rarity.Special;
		default:
			return rarity;
	}
}
