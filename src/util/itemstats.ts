import { Rarity } from '../constants/reforges';

export function GetRarityFromLore(lore: string[]) {
	const line = lore.at(-1);
	if (!line) return Rarity.Common;

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
		case line.includes('SPECIAL'):
			return Rarity.Special;
		case line.includes('DIVINE'):
			return Rarity.Divine;
		default:
			return Rarity.Common;
	}
}

export function NextRarity(rarity: Rarity): Rarity {
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
			return Rarity.Special;
		case Rarity.Special:
			return Rarity.Divine;
		case Rarity.Divine:
			return Rarity.Divine;
	}
}

export function PreviousRarity(rarity: Rarity): Rarity {
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
		case Rarity.Special:
			return Rarity.Mythic;
		case Rarity.Divine:
			return Rarity.Special;
	}
}
