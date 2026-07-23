import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

abstract class FarmhandArmorPiece extends BaseItem {
	override family = 'FARM_SUIT';
	override baseStats = {
		[Stat.Defense]: 10,
		[Stat.FarmingFortune]: 5,
	};
	override skillReq = {
		[Skill.Farming]: 3,
	};

	get wiki() {
		return 'https://w.elitesb.gg/Farmhand_Armor';
	}

	get maxRarity() {
		return Rarity.Common;
	}
}

export class FarmhandHelmet extends FarmhandArmorPiece {
	get skyblockId() {
		return 'FARM_SUIT_HELMET';
	}
	get name() {
		return 'Farmhand Helmet';
	}
	override slot = GearSlot.Helmet;
	override upgrade = {
		id: 'FARM_ARMOR_HELMET',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_WHEAT: 8,
			},
		},
	};
}

export class FarmhandChestplate extends FarmhandArmorPiece {
	get skyblockId() {
		return 'FARM_SUIT_CHESTPLATE';
	}
	get name() {
		return 'Farmhand Chestplate';
	}
	override slot = GearSlot.Chestplate;
	override upgrade = {
		id: 'FARM_ARMOR_CHESTPLATE',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_WHEAT: 8,
			},
		},
	};
}

export class FarmhandLeggings extends FarmhandArmorPiece {
	get skyblockId() {
		return 'FARM_SUIT_LEGGINGS';
	}
	get name() {
		return 'Farmhand Leggings';
	}
	override slot = GearSlot.Leggings;
	override upgrade = {
		id: 'FARM_ARMOR_LEGGINGS',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_WHEAT: 8,
			},
		},
	};
}

export class FarmhandBoots extends FarmhandArmorPiece {
	get skyblockId() {
		return 'FARM_SUIT_BOOTS';
	}
	get name() {
		return 'Farmhand Boots';
	}
	override slot = GearSlot.Boots;
	override upgrade = {
		id: 'FARM_ARMOR_BOOTS',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_WHEAT: 8,
			},
		},
	};
}
