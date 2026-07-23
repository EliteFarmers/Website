import { Crop } from '../../constants/crops.js';
import { Rarity, ReforgeTarget } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import { BaseItem } from '../base-item.js';
import type { ToolGemSlot } from './gem-slots.js';

const HOE_CROPS = [
	Crop.Cactus,
	Crop.Carrot,
	Crop.NetherWart,
	Crop.Potato,
	Crop.SugarCane,
	Crop.Wheat,
	Crop.Sunflower,
	Crop.Moonflower,
	Crop.WildRose,
] as const;

const AXE_CROPS = [Crop.CocoaBeans, Crop.Melon, Crop.Mushroom, Crop.Pumpkin] as const;

const ADVANCED_GARDENING_GEM_SLOTS: ToolGemSlot[] = [
	{
		slot_type: 'PERIDOT',
		costs: [],
	},
];

abstract class GardeningTool extends BaseItem {
	override type = ReforgeTarget.FarmingTool;
	override levelable = false;
}

export class RookieHoe extends GardeningTool {
	get skyblockId() {
		return 'ROOKIE_HOE';
	}
	get name() {
		return 'Rookie Hoe';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Rookie_Hoe';
	}
	get maxRarity() {
		return Rarity.Common;
	}
	override crops = [...HOE_CROPS];
	override baseStats = { [Stat.FarmingFortune]: 5 };
	override skillReq = { [Skill.Farming]: 1 };
}

export class RookieFarmingAxe extends GardeningTool {
	get skyblockId() {
		return 'ROOKIE_FARMING_AXE';
	}
	get name() {
		return 'Rookie Farming Axe';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Rookie_Farming_Axe';
	}
	get maxRarity() {
		return Rarity.Common;
	}
	override crops = [...AXE_CROPS];
	override baseStats = { [Stat.FarmingFortune]: 5 };
	override skillReq = { [Skill.Farming]: 1 };
}

export class BasicGardeningHoe extends GardeningTool {
	get skyblockId() {
		return 'BASIC_GARDENING_HOE';
	}
	get name() {
		return 'Basic Gardening Hoe';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Basic_Gardening_Hoe';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}
	override crops = [...HOE_CROPS];
	override baseStats = { [Stat.FarmingFortune]: 10 };
	override skillReq = { [Skill.Farming]: 5 };
}

export class BasicGardeningAxe extends GardeningTool {
	get skyblockId() {
		return 'BASIC_GARDENING_AXE';
	}
	get name() {
		return 'Basic Gardening Axe';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Basic_Gardening_Axe';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}
	override crops = [...AXE_CROPS];
	override baseStats = { [Stat.FarmingFortune]: 10 };
}

export class AdvancedGardeningHoe extends GardeningTool {
	get skyblockId() {
		return 'ADVANCED_GARDENING_HOE';
	}
	get name() {
		return 'Advanced Gardening Hoe';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Advanced_Gardening_Hoe';
	}
	get maxRarity() {
		return Rarity.Rare;
	}
	override crops = [...HOE_CROPS];
	override gemSlots = ADVANCED_GARDENING_GEM_SLOTS;
	override baseStats = { [Stat.FarmingFortune]: 15 };
	override skillReq = { [Skill.Farming]: 7 };
}

export class AdvancedGardeningAxe extends GardeningTool {
	get skyblockId() {
		return 'ADVANCED_GARDENING_AXE';
	}
	get name() {
		return 'Advanced Gardening Axe';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Advanced_Gardening_Axe';
	}
	get maxRarity() {
		return Rarity.Rare;
	}
	override crops = [...AXE_CROPS];
	override gemSlots = ADVANCED_GARDENING_GEM_SLOTS;
	override baseStats = { [Stat.FarmingFortune]: 15 };
}
