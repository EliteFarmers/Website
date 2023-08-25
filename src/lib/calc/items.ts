import type { components } from '$lib/api/api';
import { Rarity } from '$lib/constants/rates';
import { REFORGES, type Reforge } from '$lib/constants/reforges';

export type Item = components['schemas']['ItemDto'];

export function GetRarity(item: Item): Rarity {
	const line = item?.lore?.at(-1);
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

export function GetReforge(item: Item): Reforge | undefined {
	const modifier = item.attributes?.modifier;
	if (!modifier) return undefined;

	const reforge = REFORGES[modifier];

	return reforge;
}
