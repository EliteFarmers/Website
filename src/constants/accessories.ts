import { Crop } from './crops';
import { Rarity, Stat } from './reforges';
import { Skill } from './skills';

export interface FarmingAccessoryInfo {
	name: string;
	wiki: string;
	family?: string;
	maxRarity: Rarity;
	upgrade?: string;
	crops?: Crop[];
	stats?: Partial<Record<Stat, number>>;
	skillReq?: Partial<Record<Skill, number>>;
}

export const FARMING_ACCESSORIES_INFO: Partial<Record<string, FarmingAccessoryInfo>> = {
	FERMENTO_ARTIFACT: {
		name: 'Fermento Artifact',
		wiki: 'https://wiki.hypixel.net/Fermento_Artifact',
		family: 'Fermento',
		maxRarity: Rarity.Epic,
		stats: {
			[Stat.FarmingFortune]: 30,
		}
	},
	SQUASH_RING: {
		name: 'Squash Ring',
		wiki: 'https://wiki.hypixel.net/Squash_Ring',
		family: 'Fermento',
		upgrade: 'FERMENTO_ARTIFACT',
		maxRarity: Rarity.Rare,
		crops: [ Crop.Wheat, Crop.Carrot, Crop.Potato, Crop.Pumpkin, Crop.Melon, Crop.Mushroom, Crop.CocoaBeans ],
		stats: {
			[Stat.FarmingFortune]: 20,
		}
	},
	CROPIE_TALISMAN: {
		name: 'Cropie Talisman',
		wiki: 'https://wiki.hypixel.net/Cropie_Talisman',
		family: 'Fermento',
		upgrade: 'SQUASH_RING',
		maxRarity: Rarity.Uncommon,
		crops: [ Crop.Wheat, Crop.Carrot, Crop.Potato ],
		stats: {
			[Stat.FarmingFortune]: 10,
		}
	}
};
