import { UpgradeableInfo } from '../fortune/upgradeable';
import { Crop } from '../constants/crops';
import { Rarity } from '../constants/reforges';
import { Stat } from "../constants/stats";
import { Skill } from '../constants/skills';
import { UpgradeReason } from '../constants/upgrades';

export interface FarmingAccessoryInfo extends UpgradeableInfo {
	name: string;
	wiki: string;
	family?: string;
	maxRarity: Rarity;
	crops?: Crop[];
	skillReq?: Partial<Record<Skill, number>>;
}

export const FARMING_ACCESSORIES_INFO: Partial<Record<string, FarmingAccessoryInfo>> = {
	FERMENTO_ARTIFACT: {
		skyblockId: 'FERMENTO_ARTIFACT',
		name: 'Fermento Artifact',
		wiki: 'https://wiki.hypixel.net/Fermento_Artifact',
		family: 'Fermento',
		maxRarity: Rarity.Epic,
		baseStats: {
			[Stat.FarmingFortune]: 30,
		},
	},
	SQUASH_RING: {
		skyblockId: 'SQUASH_RING',
		name: 'Squash Ring',
		wiki: 'https://wiki.hypixel.net/Squash_Ring',
		family: 'Fermento',
		upgrade: {
			id: 'FERMENTO_ARTIFACT',
			reason: UpgradeReason.NextTier
		},
		maxRarity: Rarity.Rare,
		crops: [Crop.Wheat, Crop.Carrot, Crop.Potato, Crop.Pumpkin, Crop.Melon, Crop.Mushroom, Crop.CocoaBeans],
		baseStats: {
			[Stat.FarmingFortune]: 20,
		},
	},
	CROPIE_TALISMAN: {
		skyblockId: 'CROPIE_TALISMAN',
		name: 'Cropie Talisman',
		wiki: 'https://wiki.hypixel.net/Cropie_Talisman',
		family: 'Fermento',
		upgrade: {
			id: 'SQUASH_RING',
			reason: UpgradeReason.NextTier
		},
		maxRarity: Rarity.Uncommon,
		crops: [Crop.Wheat, Crop.Carrot, Crop.Potato],
		baseStats: {
			[Stat.FarmingFortune]: 10,
		},
	},
	POWER_RELIC: {
		skyblockId: 'POWER_RELIC',
		name: 'Relic of Power',
		wiki: 'https://wiki.hypixel.net/Relic_Of_Power',
		gemSlots: {
			peridot: 1,
		},
		maxRarity: Rarity.Mythic,
	},
};
