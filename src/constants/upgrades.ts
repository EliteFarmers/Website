import type { GearSlot } from "./armor";
import { Crop } from "./crops";
import { FARMING_TOOLS } from "./tools";

export enum UpgradeReason {
	Standard = 'standard', // Standard upgrade
	DeadEnd = 'dead_end', // Not worth using, no more upgrades
	Situational = 'situational', // Worth using in some situations
}

export interface Upgrade {
	id: string;
	reason: UpgradeReason;
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