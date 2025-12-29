import { Crop } from '../constants/crops.js';
import { Rarity } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import { UpgradeReason } from '../constants/upgrades.js';
import type { ItemDefinition } from './definitions.js';

export type { ItemDefinition as FarmingAccessoryInfo };

export const FARMING_ACCESSORIES_INFO: Partial<Record<string, ItemDefinition>> = {
	HELIANTHUS_RELIC: {
		skyblockId: 'HELIANTHUS_RELIC',
		name: 'Helianthus Relic',
		wiki: 'https://wiki.hypixel.net/Helianthus_Relic',
		family: 'Fermento',
		familyOrder: 4,
		maxRarity: Rarity.Rare,
		baseStats: {
			[Stat.FarmingFortune]: 40,
		},
	},
	FERMENTO_ARTIFACT: {
		skyblockId: 'FERMENTO_ARTIFACT',
		name: 'Fermento Artifact',
		wiki: 'https://wiki.hypixel.net/Fermento_Artifact',
		family: 'Fermento',
		familyOrder: 3,
		upgrade: {
			id: 'HELIANTHUS_RELIC',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					CONDENSED_HELIANTHUS: 8,
				},
			},
		},
		maxRarity: Rarity.Rare,
		crops: [
			Crop.Wheat,
			Crop.Carrot,
			Crop.Potato,
			Crop.Pumpkin,
			Crop.Melon,
			Crop.Mushroom,
			Crop.CocoaBeans,
			Crop.NetherWart,
			Crop.Cactus,
			Crop.SugarCane,
		],
		baseStats: {
			[Stat.FarmingFortune]: 30,
		},
	},
	SQUASH_RING: {
		skyblockId: 'SQUASH_RING',
		name: 'Squash Ring',
		wiki: 'https://wiki.hypixel.net/Squash_Ring',
		family: 'Fermento',
		familyOrder: 2,
		upgrade: {
			id: 'FERMENTO_ARTIFACT',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					CONDENSED_FERMENTO: 8,
				},
			},
		},
		maxRarity: Rarity.Uncommon,
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
		familyOrder: 1,
		upgrade: {
			id: 'SQUASH_RING',
			reason: UpgradeReason.NextTier,
			cost: {
				items: {
					SQUASH: 128,
				},
			},
		},
		maxRarity: Rarity.Common,
		crops: [Crop.Wheat, Crop.Carrot, Crop.Potato],
		baseStats: {
			[Stat.FarmingFortune]: 10,
		},
	},
	POWER_RELIC: {
		skyblockId: 'POWER_RELIC',
		name: 'Relic of Power',
		wiki: 'https://wiki.hypixel.net/Relic_Of_Power',
		gemSlots: [
			{ slot_type: 'JADE', costs: [] },
			{ slot_type: 'AMBER', costs: [] },
			{ slot_type: 'TOPAZ', costs: [] },
			{ slot_type: 'SAPPHIRE', costs: [] },
			{ slot_type: 'AMETHYST', costs: [] },
			{ slot_type: 'JASPER', costs: [] },
			{ slot_type: 'RUBY', costs: [] },
			{ slot_type: 'OPAL', costs: [] },
			{ slot_type: 'ONYX', costs: [] },
			{ slot_type: 'PERIDOT', costs: [] },
			{ slot_type: 'CITRINE', costs: [] },
			{ slot_type: 'AQUAMARINE', costs: [] },
		],
		cost: {
			items: {
				PERFECT_PLATE: 1,
				GLACITE_AMALGAMATION: 32,
			},
		},
		maxRarity: Rarity.Mythic,
	},
	MAGIC_8_BALL: {
		skyblockId: 'MAGIC_8_BALL',
		name: 'Magic 8 Ball',
		wiki: 'https://wiki.hypixel.net/Magic_8_Ball',
		maxRarity: Rarity.Epic,
		baseStats: {
			[Stat.FarmingFortune]: 0, // Effect is special
		},
	},
	ATMOSPHERIC_FILTER: {
		skyblockId: 'ATMOSPHERIC_FILTER',
		name: 'Atmospheric Filter',
		wiki: 'https://wiki.hypixel.net/Atmospheric_Filter',
		maxRarity: Rarity.Rare,
		baseStats: {
			[Stat.FarmingFortune]: 0, // Effect is special
		},
	},
};
