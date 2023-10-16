import { FarmingArmorInfo, GearSlot } from './armor';
import { Rarity, Stat } from './reforges';
import { Skill } from './skills';

export const LOTUS_GEAR_INFO: Partial<Record<string, FarmingArmorInfo>> = {
	LOTUS_BRACELET: {
		name: 'Lotus Bracelet',
		wiki: 'https://wiki.hypixel.net/Lotus_Bracelet',
		family: 'LOTUS',
		slot: GearSlot.Gloves,
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 5,
		},
		skillReq: {
			[Skill.Farming]: 10,
			[Skill.Garden]: 2,
		},
	},
	LOTUS_BELT: {
		name: 'Lotus Belt',
		wiki: 'https://wiki.hypixel.net/Lotus_Belt',
		family: 'LOTUS',
		slot: GearSlot.Belt,
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 5,
		},
		skillReq: {
			[Skill.Farming]: 10,
			[Skill.Garden]: 3,
		},
	},
	LOTUS_NECKLACE: {
		name: 'Lotus Necklace',
		wiki: 'https://wiki.hypixel.net/Lotus_Necklace',
		family: 'LOTUS',
		slot: GearSlot.Necklace,
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 5,
		},
		skillReq: {
			[Skill.Farming]: 10,
			[Skill.Garden]: 4,
		},
	},
	LOTUS_CLOAK: {
		name: 'Lotus Cloak',
		wiki: 'https://wiki.hypixel.net/Lotus_Cloak',
		family: 'LOTUS',
		slot: GearSlot.Cloak,
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 5,
		},
		skillReq: {
			[Skill.Farming]: 10,
			[Skill.Garden]: 5,
		},
	},
};

export const VISITORS_SERVED_BONUS = {
	1: 1,
	5: 2,
	10: 3,
	20: 4,
	50: 5,
	75: 6,
	100: 7,
	150: 8,
	250: 9,
	500: 10,
	1000: 11,
	2000: 12,
	3000: 13,
	4000: 14,
	5000: 15,
};

export const GREEN_THUMB_MULTIPLIER = {
	1: 0.05,
	2: 0.1,
	3: 0.15,
	4: 0.2,
	5: 0.25,
};
