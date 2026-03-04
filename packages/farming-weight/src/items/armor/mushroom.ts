import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

export class MushroomHelmet extends BaseItem {
	get skyblockId() {
		return 'MUSHROOM_HELMET';
	}
	get name() {
		return 'Mushroom Helmet';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Mushroom_Armor';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'MUSHROOM_ARMOR';
	override slot = GearSlot.Helmet;

	override upgrade = {
		id: 'BIOHAZARD_HELMET',
		reason: UpgradeReason.NextTier,
	};

	override baseStats = {
		[Stat.BonusPestChance]: 16.5,
	};

	override skillReq = {
		[Skill.Farming]: 7,
	};
}

export class MushroomChestplate extends BaseItem {
	get skyblockId() {
		return 'MUSHROOM_CHESTPLATE';
	}
	get name() {
		return 'Mushroom Chestplate';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Mushroom_Armor';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'MUSHROOM_ARMOR';
	override slot = GearSlot.Chestplate;

	override upgrade = {
		id: 'BIOHAZARD_CHESTPLATE',
		reason: UpgradeReason.NextTier,
	};

	override baseStats = {
		[Stat.BonusPestChance]: 16.5,
	};

	override skillReq = {
		[Skill.Farming]: 7,
	};
}

export class MushroomLeggings extends BaseItem {
	get skyblockId() {
		return 'MUSHROOM_LEGGINGS';
	}
	get name() {
		return 'Mushroom Leggings';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Mushroom_Armor';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'MUSHROOM_ARMOR';
	override slot = GearSlot.Leggings;

	override upgrade = {
		id: 'BIOHAZARD_LEGGINGS',
		reason: UpgradeReason.NextTier,
	};

	override baseStats = {
		[Stat.BonusPestChance]: 16.5,
	};

	override skillReq = {
		[Skill.Farming]: 7,
	};
}

export class MushroomBoots extends BaseItem {
	get skyblockId() {
		return 'MUSHROOM_BOOTS';
	}
	get name() {
		return 'Mushroom Boots';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Mushroom_Armor';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'MUSHROOM_ARMOR';
	override slot = GearSlot.Boots;

	override upgrade = {
		id: 'BIOHAZARD_BOOTS',
		reason: UpgradeReason.NextTier,
	};

	override baseStats = {
		[Stat.BonusPestChance]: 16.5,
	};

	override skillReq = {
		[Skill.Farming]: 7,
	};
}
