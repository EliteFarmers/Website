import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

export class BiohazardHelmet extends BaseItem {
	get skyblockId() { return 'BIOHAZARD_HELMET'; }
	get name() { return 'Biohazard Helmet'; }
	get wiki() { return 'https://wiki.hypixel.net/Biohazard_Armor'; }
	get maxRarity() { return Rarity.Epic; }

	override family = 'BIOHAZARD_ARMOR';
	override slot = GearSlot.Helmet;

	override baseStats = {
		[Stat.BonusPestChance]: 16.5,
	};

	override skillReq = {
		[Skill.Farming]: 7,
	};
}

export class BiohazardChestplate extends BaseItem {
	get skyblockId() { return 'BIOHAZARD_CHESTPLATE'; }
	get name() { return 'Biohazard Chestplate'; }
	get wiki() { return 'https://wiki.hypixel.net/Biohazard_Armor'; }
	get maxRarity() { return Rarity.Epic; }

	override family = 'BIOHAZARD_ARMOR';
	override slot = GearSlot.Chestplate;

	override baseStats = {
		[Stat.BonusPestChance]: 16.5,
	};

	override skillReq = {
		[Skill.Farming]: 7,
	};
}

export class BiohazardLeggings extends BaseItem {
	get skyblockId() { return 'BIOHAZARD_LEGGINGS'; }
	get name() { return 'Biohazard Leggings'; }
	get wiki() { return 'https://wiki.hypixel.net/Biohazard_Armor'; }
	get maxRarity() { return Rarity.Epic; }

	override family = 'BIOHAZARD_ARMOR';
	override slot = GearSlot.Leggings;

	override baseStats = {
		[Stat.BonusPestChance]: 16.5,
	};

	override skillReq = {
		[Skill.Farming]: 7,
	};
}

export class BiohazardBoots extends BaseItem {
	get skyblockId() { return 'BIOHAZARD_BOOTS'; }
	get name() { return 'Biohazard Boots'; }
	get wiki() { return 'https://wiki.hypixel.net/Biohazard_Armor'; }
	get maxRarity() { return Rarity.Epic; }

	override family = 'BIOHAZARD_ARMOR';
	override slot = GearSlot.Boots;

	override baseStats = {
		[Stat.BonusPestChance]: 16.5,
	};

	override skillReq = {
		[Skill.Farming]: 7,
	};
}
