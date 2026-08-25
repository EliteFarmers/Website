import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

abstract class HaymakerArmorPiece extends BaseItem {
	override family = 'FARM_ARMOR';
	override baseStats = {
		[Stat.Defense]: 15,
		[Stat.FarmingFortune]: 10,
	};
	override skillReq = {
		[Skill.Farming]: 10,
	};

	get wiki() {
		return 'https://w.elitesb.gg/Haymaker_Armor';
	}

	get baseRarity() {
		return Rarity.Common;
	}
}

export class FarmArmorHelmet extends HaymakerArmorPiece {
	get skyblockId() {
		return 'FARM_ARMOR_HELMET';
	}
	get name() {
		return 'Haymaker Helmet';
	}
	override slot = GearSlot.Helmet;
	override upgrade = {
		id: 'PUMPKIN_HELMET',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_CARROT: 64,
			},
		},
	};
}

export class FarmArmorChestplate extends HaymakerArmorPiece {
	get skyblockId() {
		return 'FARM_ARMOR_CHESTPLATE';
	}
	get name() {
		return 'Haymaker Chestplate';
	}
	override slot = GearSlot.Chestplate;
	override upgrade = {
		id: 'PUMPKIN_CHESTPLATE',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_CARROT: 64,
			},
		},
	};
}

export class FarmArmorLeggings extends HaymakerArmorPiece {
	get skyblockId() {
		return 'FARM_ARMOR_LEGGINGS';
	}
	get name() {
		return 'Haymaker Leggings';
	}
	override slot = GearSlot.Leggings;
	override upgrade = {
		id: 'PUMPKIN_LEGGINGS',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_CARROT: 64,
			},
		},
	};
}

export class FarmArmorBoots extends HaymakerArmorPiece {
	get skyblockId() {
		return 'FARM_ARMOR_BOOTS';
	}
	get name() {
		return 'Haymaker Boots';
	}
	override slot = GearSlot.Boots;
	override upgrade = {
		id: 'PUMPKIN_BOOTS',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_CARROT: 64,
			},
		},
	};
}
