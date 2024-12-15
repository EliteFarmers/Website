import { GemRarity } from '../fortune/item.js';
import { Rarity } from './reforges.js';

export const PERIDOT: Partial<Record<Rarity, Record<GemRarity, number>>> = {
	[Rarity.Common]: {
		[GemRarity.Rough]: 0.5,
		[GemRarity.Flawed]: 1,
		[GemRarity.Fine]: 1.5,
		[GemRarity.Flawless]: 2,
		[GemRarity.Perfect]: 3,
	},
	[Rarity.Uncommon]: {
		[GemRarity.Rough]: 1,
		[GemRarity.Flawed]: 1.5,
		[GemRarity.Fine]: 2,
		[GemRarity.Flawless]: 3,
		[GemRarity.Perfect]: 4,
	},
	[Rarity.Rare]: {
		[GemRarity.Rough]: 1.5,
		[GemRarity.Flawed]: 2,
		[GemRarity.Fine]: 3,
		[GemRarity.Flawless]: 4,
		[GemRarity.Perfect]: 5,
	},
	[Rarity.Epic]: {
		[GemRarity.Rough]: 2,
		[GemRarity.Flawed]: 2.5,
		[GemRarity.Fine]: 4,
		[GemRarity.Flawless]: 5,
		[GemRarity.Perfect]: 6,
	},
	[Rarity.Legendary]: {
		[GemRarity.Rough]: 2.5,
		[GemRarity.Flawed]: 3,
		[GemRarity.Fine]: 5,
		[GemRarity.Flawless]: 6,
		[GemRarity.Perfect]: 8,
	},
	[Rarity.Mythic]: {
		[GemRarity.Rough]: 3,
		[GemRarity.Flawed]: 4,
		[GemRarity.Fine]: 6,
		[GemRarity.Flawless]: 8,
		[GemRarity.Perfect]: 10,
	},
};
