import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

abstract class SproutArmorPiece extends BaseItem {
	override family = 'PUMPKIN';
	override baseStats = {
		[Stat.Defense]: 20,
		[Stat.FarmingFortune]: 15,
	};
	override skillReq = {
		[Skill.Farming]: 15,
	};

	get wiki() {
		return 'https://w.elitesb.gg/Sprout_Armor';
	}

	get maxRarity() {
		return Rarity.Uncommon;
	}
}

export class SproutHelmet extends SproutArmorPiece {
	get skyblockId() {
		return 'PUMPKIN_HELMET';
	}
	get name() {
		return 'Sprout Helmet';
	}
	override slot = GearSlot.Helmet;
	override upgrade = {
		id: 'MELON_HELMET',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_POTATO: 256,
			},
		},
	};
}

export class SproutChestplate extends SproutArmorPiece {
	get skyblockId() {
		return 'PUMPKIN_CHESTPLATE';
	}
	get name() {
		return 'Sprout Chestplate';
	}
	override slot = GearSlot.Chestplate;
	override upgrade = {
		id: 'MELON_CHESTPLATE',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_POTATO: 256,
			},
		},
	};
}

export class SproutLeggings extends SproutArmorPiece {
	get skyblockId() {
		return 'PUMPKIN_LEGGINGS';
	}
	get name() {
		return 'Sprout Leggings';
	}
	override slot = GearSlot.Leggings;
	override upgrade = {
		id: 'MELON_LEGGINGS',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_POTATO: 256,
			},
		},
	};
}

export class SproutBoots extends SproutArmorPiece {
	get skyblockId() {
		return 'PUMPKIN_BOOTS';
	}
	get name() {
		return 'Sprout Boots';
	}
	override slot = GearSlot.Boots;
	override upgrade = {
		id: 'MELON_BOOTS',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_POTATO: 256,
			},
		},
	};
}
