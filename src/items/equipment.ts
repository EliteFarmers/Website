import { FarmingArmorInfo, GearSlot } from './armor';
import { Rarity } from '../constants/reforges';
import { Stat } from '../constants/stats';
import { Skill } from '../constants/skills';
import { UpgradeReason } from '../constants/upgrades';

export const EQUIPMENT_INFO: Partial<Record<string, FarmingArmorInfo>> = {
	LOTUS_BRACELET: {
		skyblockId: 'LOTUS_BRACELET',
		name: 'Lotus Bracelet',
		wiki: 'https://wiki.hypixel.net/Lotus_Bracelet',
		family: 'LOTUS',
		slot: GearSlot.Gloves,
		maxRarity: Rarity.Epic,
		baseStats: {
			[Stat.FarmingFortune]: 5,
		},
		skillReq: {
			[Skill.Farming]: 10,
			[Skill.Garden]: 2,
		},
	},
	LOTUS_BELT: {
		skyblockId: 'LOTUS_BELT',
		name: 'Lotus Belt',
		wiki: 'https://wiki.hypixel.net/Lotus_Belt',
		family: 'LOTUS',
		slot: GearSlot.Belt,
		maxRarity: Rarity.Epic,
		baseStats: {
			[Stat.FarmingFortune]: 5,
		},
		skillReq: {
			[Skill.Farming]: 10,
			[Skill.Garden]: 3,
		},
	},
	LOTUS_NECKLACE: {
		skyblockId: 'LOTUS_NECKLACE',
		name: 'Lotus Necklace',
		wiki: 'https://wiki.hypixel.net/Lotus_Necklace',
		family: 'LOTUS',
		slot: GearSlot.Necklace,
		maxRarity: Rarity.Epic,
		baseStats: {
			[Stat.FarmingFortune]: 5,
		},
		skillReq: {
			[Skill.Farming]: 10,
			[Skill.Garden]: 4,
		},
	},
	LOTUS_CLOAK: {
		skyblockId: 'LOTUS_CLOAK',
		name: 'Lotus Cloak',
		wiki: 'https://wiki.hypixel.net/Lotus_Cloak',
		upgrade: {
			id: 'ZORROS_CAPE',
			reason: UpgradeReason.Situational,
			why: 'A maxed Zorro\'s Cape provides significantly more fortune during a Jacob\'s contest, but slightly less outside of one.',
		},
		family: 'LOTUS',
		slot: GearSlot.Cloak,
		maxRarity: Rarity.Epic,
		baseStats: {
			[Stat.FarmingFortune]: 5,
		},
		skillReq: {
			[Skill.Farming]: 10,
			[Skill.Garden]: 5,
		},
	},
	ZORROS_CAPE: {
		skyblockId: 'ZORROS_CAPE',
		name: "Zorro's Cape",
		wiki: 'https://wiki.hypixel.net/Zorro%27s_Cape',
		upgrade: {
			id: 'LOTUS_CLOAK',
			reason: UpgradeReason.Situational,
			why: 'A maxed Lotus Cloak provides slightly more fortune outside of a Jacob\'s contest, but significantly less fortune during one compared to a maxed Zorro\'s Cape.',
		},
		slot: GearSlot.Cloak,
		maxRarity: Rarity.Mythic,
		baseStats: {
			[Stat.FarmingFortune]: 10,
			[Stat.FarmingWisdom]: 1,
			[Stat.Strength]: 10,
			[Stat.Ferocity]: 2,
		},
		contestStatsMultiplier: 2
	},
	PEST_VEST: {
		skyblockId: 'PEST_VEST',
		name: 'Pest Vest',
		wiki: 'https://wiki.hypixel.net/Pest_Vest',
		slot: GearSlot.Cloak,
		maxRarity: Rarity.Legendary,
		baseStats: {
			[Stat.BonusPestChance]: 10
		}
	}
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
