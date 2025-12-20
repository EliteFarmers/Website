import type { Crop } from '../constants/crops.js';
import { ReforgeTarget } from '../constants/reforges.js';
import type { Skill } from '../constants/skills.js';
import type { SpecialCrop } from '../constants/specialcrops.js';
import type { Stat } from '../constants/stats.js';
import type { UpgradeableInfo } from '../fortune/upgradeable.js';

export enum GearSlot {
	Boots = 'Boots',
	Leggings = 'Leggings',
	Chestplate = 'Chestplate',
	Helmet = 'Helmet',
	Necklace = 'Necklace',
	Cloak = 'Cloak',
	Belt = 'Belt',
	Gloves = 'Gloves',
}

export interface GearSlotInfo {
	name: string;
	startingItem: string;
	target: ReforgeTarget;
}

export const GEAR_SLOTS: Record<GearSlot, GearSlotInfo> = {
	[GearSlot.Helmet]: {
		name: 'Helmet',
		target: ReforgeTarget.Armor,
		startingItem: 'FARM_ARMOR_HELMET',
	},
	[GearSlot.Chestplate]: {
		name: 'Chestplate',
		target: ReforgeTarget.Armor,
		startingItem: 'FARM_ARMOR_CHESTPLATE',
	},
	[GearSlot.Leggings]: {
		name: 'Leggings',
		target: ReforgeTarget.Armor,
		startingItem: 'FARM_ARMOR_LEGGINGS',
	},
	[GearSlot.Boots]: {
		name: 'Boots',
		target: ReforgeTarget.Armor,
		startingItem: 'FARM_ARMOR_BOOTS',
	},
	[GearSlot.Necklace]: {
		name: 'Necklace',
		target: ReforgeTarget.Equipment,
		startingItem: 'LOTUS_NECKLACE',
	},
	[GearSlot.Cloak]: {
		name: 'Cloak',
		target: ReforgeTarget.Equipment,
		startingItem: 'LOTUS_CLOAK',
	},
	[GearSlot.Belt]: {
		name: 'Belt',
		target: ReforgeTarget.Equipment,
		startingItem: 'LOTUS_BELT',
	},
	[GearSlot.Gloves]: {
		name: 'Gloves',
		target: ReforgeTarget.Equipment,
		startingItem: 'LOTUS_BRACELET',
	},
};

export enum FarmingToolType {
	Other = 'Other',
	Dicer = 'Dicer',
	MathematicalHoe = 'Mathematical Hoe',
	None = 'None',
}

export interface ItemDefinition extends UpgradeableInfo {
	// Tools
	type?: FarmingToolType | ReforgeTarget;
	crop?: Crop;
	crops?: Crop[];

	// Armor
	slot?: GearSlot;
	special?: SpecialCrop[];
	family?: string;
	familyOrder?: number;
	contestStatsMultiplier?: number;

	skillReq?: Partial<Record<Skill, number>>;
	perLevelStats?: {
		skill: Skill;
		appliesTo?: ReforgeTarget[];
		stats: Partial<Record<Stat, number>>;
	};
}
