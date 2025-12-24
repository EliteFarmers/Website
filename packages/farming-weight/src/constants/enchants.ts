import type { FarmingPlayer } from '../player/player.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import { Crop } from './crops.js';
import { CROP_MILESTONES } from './garden.js';
import { ReforgeTarget } from './reforges.js';
import { Stat } from './stats.js';
import type { UpgradeCost } from './upgrades.js';

export enum EnchantTierProcurement {
	Normal = 'normal',
	Loot = 'loot',
	SelfLeveling = 'selfleveling',
	UpgradeItem = 'upgradeitem',
}

export interface FarmingEnchantTier {
	stats?: Partial<Record<Stat, number>>;
	computedStats?: (opt: FarmingPlayer) => Partial<Record<Stat, number>>;
	computed?: Partial<Record<Stat, (opt: PlayerOptions) => number>>;
	cropComputed?: Partial<Record<Stat, (crop: Crop, opt?: PlayerOptions) => number>>;
	procurement?: EnchantTierProcurement;
	cost?: UpgradeCost;
}

export interface FarmingEnchant {
	name: string;
	id?: string;
	alwaysInclude?: true;
	appliesTo: readonly ReforgeTarget[];
	wiki: string;
	minLevel: number;
	maxLevel: number;
	cropSpecific?: Crop;
	levels: Record<number, FarmingEnchantTier>;
	computedLevels?: (opt: PlayerOptions) => Record<number, FarmingEnchantTier>;
	maxStats?: Partial<Record<Stat, number>>;
	levelRequirement?: number;
}

const turboEnchant = {
	appliesTo: [ReforgeTarget.Hoe, ReforgeTarget.Axe],
	minLevel: 1,
	maxLevel: 5,
	levels: {
		1: {
			stats: {
				[Stat.FarmingFortune]: 5,
			},
		},
		2: {
			stats: {
				[Stat.FarmingFortune]: 10,
			},
		},
		3: {
			stats: {
				[Stat.FarmingFortune]: 15,
			},
		},
		4: {
			stats: {
				[Stat.FarmingFortune]: 20,
			},
		},
		5: {
			stats: {
				[Stat.FarmingFortune]: 25,
			},
		},
	},
};

export const FARMING_ENCHANTS: Record<string, FarmingEnchant> = {
	harvesting: {
		name: 'Harvesting',
		appliesTo: [ReforgeTarget.Hoe],
		wiki: 'https://wiki.hypixel.net/Harvesting_Enchantment',
		levelRequirement: 2,
		minLevel: 1,
		maxLevel: 6,
		levels: {
			1: {
				stats: {
					[Stat.FarmingFortune]: 12.5,
				},
			},
			2: {
				stats: {
					[Stat.FarmingFortune]: 25,
				},
			},
			3: {
				stats: {
					[Stat.FarmingFortune]: 37.5,
				},
			},
			4: {
				stats: {
					[Stat.FarmingFortune]: 50,
				},
			},
			5: {
				stats: {
					[Stat.FarmingFortune]: 62.5,
				},
			},
			6: {
				stats: {
					[Stat.FarmingFortune]: 75,
				},
				procurement: EnchantTierProcurement.Loot,
			},
		},
	},
	cultivating: {
		name: 'Cultivating',
		appliesTo: [ReforgeTarget.Hoe, ReforgeTarget.Axe],
		wiki: 'https://wiki.hypixel.net/Cultivating_Enchantment',
		minLevel: 1,
		maxLevel: 10,
		levels: {
			1: {
				stats: {
					[Stat.FarmingWisdom]: 1,
					[Stat.FarmingFortune]: 2,
				},
				cost: {
					bits: 4000,
				},
			},
			2: {
				stats: {
					[Stat.FarmingWisdom]: 2,
					[Stat.FarmingFortune]: 4,
				},
				procurement: EnchantTierProcurement.SelfLeveling,
			},
			3: {
				stats: {
					[Stat.FarmingWisdom]: 3,
					[Stat.FarmingFortune]: 6,
				},
				procurement: EnchantTierProcurement.SelfLeveling,
			},
			4: {
				stats: {
					[Stat.FarmingWisdom]: 4,
					[Stat.FarmingFortune]: 8,
				},
				procurement: EnchantTierProcurement.SelfLeveling,
			},
			5: {
				stats: {
					[Stat.FarmingWisdom]: 5,
					[Stat.FarmingFortune]: 10,
				},
				procurement: EnchantTierProcurement.SelfLeveling,
			},
			6: {
				stats: {
					[Stat.FarmingWisdom]: 6,
					[Stat.FarmingFortune]: 12,
				},
				procurement: EnchantTierProcurement.SelfLeveling,
			},
			7: {
				stats: {
					[Stat.FarmingWisdom]: 7,
					[Stat.FarmingFortune]: 14,
				},
				procurement: EnchantTierProcurement.SelfLeveling,
			},
			8: {
				stats: {
					[Stat.FarmingWisdom]: 8,
					[Stat.FarmingFortune]: 16,
				},
				procurement: EnchantTierProcurement.SelfLeveling,
			},
			9: {
				stats: {
					[Stat.FarmingWisdom]: 9,
					[Stat.FarmingFortune]: 18,
				},
				procurement: EnchantTierProcurement.SelfLeveling,
			},
			10: {
				stats: {
					[Stat.FarmingWisdom]: 10,
					[Stat.FarmingFortune]: 20,
				},
				procurement: EnchantTierProcurement.SelfLeveling,
			},
		},
	},
	dedication: {
		name: 'Dedication',
		appliesTo: [ReforgeTarget.Hoe, ReforgeTarget.Axe],
		wiki: 'https://wiki.hypixel.net/Dedication_Enchantment',
		minLevel: 1,
		maxLevel: 4,
		levels: {
			1: {
				cost: {
					copper: 250,
				},
				cropComputed: {
					[Stat.FarmingFortune]: (crop, opt) => {
						if (!crop) return 0;
						return 0.5 * (opt?.milestones?.[crop] ?? 0);
					},
				},
			},
			2: {
				cropComputed: {
					[Stat.FarmingFortune]: (crop, opt) => {
						if (!crop) return 0;
						return 0.75 * (opt?.milestones?.[crop] ?? 0);
					},
				},
			},
			3: {
				cropComputed: {
					[Stat.FarmingFortune]: (crop, opt) => {
						if (!crop) return 0;
						return 1 * (opt?.milestones?.[crop] ?? 0);
					},
				},
			},
			4: {
				cropComputed: {
					[Stat.FarmingFortune]: (crop, opt) => {
						if (!crop) return 0;
						return 2 * (opt?.milestones?.[crop] ?? 0);
					},
				},
				procurement: EnchantTierProcurement.Loot,
			},
		},
		maxStats: {
			[Stat.FarmingFortune]: 2 * CROP_MILESTONES[Crop.Wheat].length,
		},
	},
	sunder: {
		name: 'Sunder',
		appliesTo: [ReforgeTarget.Axe],
		wiki: 'https://wiki.hypixel.net/Sunder_Enchantment',
		minLevel: 1,
		maxLevel: 6,
		levels: {
			1: {
				stats: {
					[Stat.FarmingFortune]: 12.5,
				},
				cost: {
					copper: 10,
				},
			},
			2: {
				stats: {
					[Stat.FarmingFortune]: 25,
				},
			},
			3: {
				stats: {
					[Stat.FarmingFortune]: 37.5,
				},
			},
			4: {
				stats: {
					[Stat.FarmingFortune]: 50,
				},
			},
			5: {
				stats: {
					[Stat.FarmingFortune]: 62.5,
				},
			},
			6: {
				stats: {
					[Stat.FarmingFortune]: 75,
				},
				procurement: EnchantTierProcurement.Loot,
			},
		},
	},
	pesterminator: {
		name: 'Pesterminator',
		appliesTo: [ReforgeTarget.Armor],
		wiki: 'https://wiki.hypixel.net/Pesterminator_Enchantment',
		levelRequirement: 10,
		minLevel: 1,
		maxLevel: 6,
		levels: {
			1: {
				stats: {
					[Stat.BonusPestChance]: 1,
					[Stat.FarmingFortune]: 2,
				},
			},
			2: {
				stats: {
					[Stat.BonusPestChance]: 2,
					[Stat.FarmingFortune]: 4,
				},
			},
			3: {
				stats: {
					[Stat.BonusPestChance]: 3,
					[Stat.FarmingFortune]: 6,
				},
			},
			4: {
				stats: {
					[Stat.BonusPestChance]: 4,
					[Stat.FarmingFortune]: 8,
				},
			},
			5: {
				stats: {
					[Stat.BonusPestChance]: 5,
					[Stat.FarmingFortune]: 10,
				},
			},
			6: {
				stats: {
					[Stat.BonusPestChance]: 6,
					[Stat.FarmingFortune]: 12,
				},
				procurement: EnchantTierProcurement.UpgradeItem,
				cost: {
					items: {
						PESTHUNTING_GUIDE: 1,
					},
				},
			},
		},
	},
	green_thumb: {
		name: 'Green Thumb',
		appliesTo: [ReforgeTarget.Equipment],
		wiki: 'https://wiki.hypixel.net/Green_Thumb_Enchantment',
		levelRequirement: 24,
		minLevel: 1,
		maxLevel: 5,
		levels: {
			1: {
				computed: {
					[Stat.FarmingFortune]: (opt) => 0.05 * (opt.uniqueVisitors ?? 0),
				},
				cost: {
					copper: 1500,
				},
			},
			2: {
				computed: {
					[Stat.FarmingFortune]: (opt) => 0.1 * (opt.uniqueVisitors ?? 0),
				},
			},
			3: {
				computed: {
					[Stat.FarmingFortune]: (opt) => 0.15 * (opt.uniqueVisitors ?? 0),
				},
			},
			4: {
				computed: {
					[Stat.FarmingFortune]: (opt) => 0.2 * (opt.uniqueVisitors ?? 0),
				},
			},
			5: {
				computed: {
					[Stat.FarmingFortune]: (opt) => 0.25 * (opt.uniqueVisitors ?? 0),
				},
			},
		},
		maxStats: {
			[Stat.FarmingFortune]: 0.25 * 137, //Object.keys(GARDEN_VISITORS).length,
		},
	},
	turbo_cactus: {
		name: 'Turbo-Cacti',
		wiki: 'https://wiki.hypixel.net/Turbo-Cacti_Enchantment',
		cropSpecific: Crop.Cactus,
		...turboEnchant,
	},
	turbo_cane: {
		name: 'Turbo-Cane',
		wiki: 'https://wiki.hypixel.net/Turbo-Cane_Enchantment',
		cropSpecific: Crop.SugarCane,
		...turboEnchant,
	},
	turbo_carrot: {
		name: 'Turbo-Carrot',
		wiki: 'https://wiki.hypixel.net/Turbo-Carrot_Enchantment',
		cropSpecific: Crop.Carrot,
		...turboEnchant,
	},
	turbo_coco: {
		name: 'Turbo-Cocoa',
		id: 'ENCHANTMENT_TURBO_COCO',
		wiki: 'https://wiki.hypixel.net/Turbo-Cocoa_Enchantment',
		cropSpecific: Crop.CocoaBeans,
		...turboEnchant,
	},
	turbo_melon: {
		name: 'Turbo-Melon',
		wiki: 'https://wiki.hypixel.net/Turbo-Melon_Enchantment',
		cropSpecific: Crop.Melon,
		...turboEnchant,
	},
	turbo_mushrooms: {
		name: 'Turbo-Mushrooms',
		wiki: 'https://wiki.hypixel.net/Turbo-Mushrooms_Enchantment',
		cropSpecific: Crop.Mushroom,
		...turboEnchant,
	},
	turbo_potato: {
		name: 'Turbo-Potato',
		wiki: 'https://wiki.hypixel.net/Turbo-Potato_Enchantment',
		cropSpecific: Crop.Potato,
		...turboEnchant,
	},
	turbo_pumpkin: {
		name: 'Turbo-Pumpkin',
		wiki: 'https://wiki.hypixel.net/Turbo-Pumpkin_Enchantment',
		cropSpecific: Crop.Pumpkin,
		...turboEnchant,
	},
	turbo_warts: {
		name: 'Turbo-Warts',
		wiki: 'https://wiki.hypixel.net/Turbo-Warts_Enchantment',
		cropSpecific: Crop.NetherWart,
		...turboEnchant,
	},
	turbo_wheat: {
		name: 'Turbo-Wheat',
		wiki: 'https://wiki.hypixel.net/Turbo-Wheat_Enchantment',
		cropSpecific: Crop.Wheat,
		...turboEnchant,
	},
	turbo_rose: {
		name: 'Turbo-Rose',
		wiki: 'https://wiki.hypixel.net/Turbo-Rose_Enchantment',
		cropSpecific: Crop.WildRose,
		...turboEnchant,
	},
	turbo_moonflower: {
		name: 'Turbo-Moonflower',
		wiki: 'https://wiki.hypixel.net/Turbo-Moonflower_Enchantment',
		cropSpecific: Crop.Moonflower,
		...turboEnchant,
	},
	turbo_sunflower: {
		name: 'Turbo-Sunflower',
		wiki: 'https://wiki.hypixel.net/Turbo-Sunflower_Enchantment',
		cropSpecific: Crop.Sunflower,
		...turboEnchant,
	},
	ultimate_crop_fever: {
		name: 'Crop Fever',
		id: 'ENCHANTMENT_ULTIMATE_CROP_FEVER',
		alwaysInclude: true,
		appliesTo: [ReforgeTarget.Hoe, ReforgeTarget.Axe],
		wiki: 'https://wiki.hypixel.net/Ultimate_Crop_Fever_Enchantment',
		minLevel: 1,
		maxLevel: 5,
		levels: {
			1: {},
			2: {},
			3: {},
			4: {},
			5: {},
		},
	},
} as const;

export const depthStriderLevels = [1, 2, 3] as const;
export type DepthStriderLevels = (typeof depthStriderLevels)[number];
