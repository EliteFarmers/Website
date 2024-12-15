import { EliteItemDto } from '../fortune/item.js';
import { UpgradeableInfo } from '../fortune/upgradeable.js';
import type { GearSlot } from '../items/armor.js';
import type { FARMING_TOOLS } from '../items/tools.js';
import { Crop } from './crops.js';
import { Stat } from './stats.js';

export enum UpgradeReason {
	NextTier = 'next', // Standard upgrade
	DeadEnd = 'dead', // Not worth using, no more upgrades
	Situational = 'situational', // Worth using in some situations
}

// export interface UpgradeCost {
// 	items: Record<string, number>;
// 	coins?: number;
// 	copper?: number;
// }

export interface FortuneSource {
	name: string;
	fortunePerLevel: number;
	cropSpecific?: boolean;
	maxLevel: number;
	wiki: string;
	statsPerLevel?: Partial<Record<Stat, number>>;
}

export interface FortuneSourceProgress {
	name: string;
	fortune: number;
	ratio: number;
	maxLevel?: number;
	fortunePerLevel?: number;
	maxFortune: number;
	wiki?: string;
	upgrades?: FortuneUpgrade[];
	progress?: FortuneSourceProgress[];
	item?: EliteItemDto;
	info?: UpgradeableInfo;
	nextInfo?: UpgradeableInfo;
	maxInfo?: UpgradeableInfo;
	api?: boolean;
}

export interface UpgradeCost {
	items: Record<string, number>;
	coins?: number;
	copper?: number;
}

export enum UpgradeCategory {
	Enchant = 'enchant',
	Rarity = 'rarity',
	Item = 'item',
	Gem = 'gem',
}

export enum UpgradeAction {
	Apply = 'apply',
	Recombobulate = 'recombobulate',
	LevelUp = 'levelup',
}

export interface FortuneUpgradeImprovement {
	name: string;
	fortune: number;
}

export interface FortuneUpgrade {
	title: string;
	increase: number;
	action: UpgradeAction;
	category: UpgradeCategory;
	cost?: UpgradeCost;
	wiki?: string;
	improvements?: FortuneUpgradeImprovement[];
	// upgrade: Upgrade;
}

export interface Upgrade {
	id: string;
	reason: UpgradeReason;
	cost?: UpgradeCost;
	why?: string;
}

export interface InitialItems {
	tools: Partial<Record<Crop, keyof typeof FARMING_TOOLS>>;
	armor: Record<GearSlot, string | string[]>;
	pets: string[];
}

// export const INITIAL_ITEMS: InitialItems = {
// 	tools: {
// 		[Crop.Cactus]: 'CACTUS_KNIFE',
// 		[Crop.CocoaBeans]: 'COCO_CHOPPER',
// 		[Crop.Carrot]: 'THEORETICAL_HOE_CARROT_1',
// 		[Crop.Melon]: 'MELON_DICER',
// 		[Crop.Mushroom]: 'FUNGI_CUTTER',
// 		[Crop.NetherWart]: 'THEORETICAL_HOE_WARTS_1',
// 		[Crop.Potato]: 'THEORETICAL_HOE_POTATO_1',
// 		[Crop.Pumpkin]: 'PUMPKIN_DICER',
// 		[Crop.SugarCane]: 'THEORETICAL_HOE_CANE_1',
// 		[Crop.Wheat]: 'THEORETICAL_HOE_WHEAT_1'
// 	},
// 	armor: {
// 		[GearSlot.Boots]: [ 'MELON_BOOTS', 'FARMER_BOOTS', 'RANCHERS_BOOTS' ],
// 		[GearSlot.Leggings]: 'MELON_LEGGINGS',
// 		[GearSlot.Chestplate]: 'MELON_CHESTPLATE',
// 		[GearSlot.Helmet]: 'MELON_HELMET',
// 		[GearSlot.Necklace]: 'LOTUS_NECKLACE',
// 		[GearSlot.Cloak]: 'LOTUS_CLOAK',
// 		[GearSlot.Belt]: 'LOTUS_BELT',
// 		[GearSlot.Gloves]: 'LOTUS_BRACELET',
// 	},
// 	pets: [ 'ELEPHANT', 'MOOSHROOM_COW' ]
// };
