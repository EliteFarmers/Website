import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

export class BlossomBracelet extends BaseItem {
	get skyblockId() {
		return 'BLOSSOM_BRACELET';
	}
	get name() {
		return 'Blossom Bracelet';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Blossom_Bracelet';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override family = 'LOTUS';
	override slot = GearSlot.Gloves;
	override baseStats = { [Stat.FarmingFortune]: 7 };
	override skillReq = { [Skill.Farming]: 20, [Skill.Garden]: 6 };
}

export class BlossomBelt extends BaseItem {
	get skyblockId() {
		return 'BLOSSOM_BELT';
	}
	get name() {
		return 'Blossom Belt';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Blossom_Belt';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override family = 'LOTUS';
	override slot = GearSlot.Belt;
	override baseStats = { [Stat.FarmingFortune]: 7 };
	override skillReq = { [Skill.Farming]: 20, [Skill.Garden]: 6 };
}

export class BlossomNecklace extends BaseItem {
	get skyblockId() {
		return 'BLOSSOM_NECKLACE';
	}
	get name() {
		return 'Blossom Necklace';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Blossom_Necklace';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override family = 'LOTUS';
	override slot = GearSlot.Necklace;
	override baseStats = { [Stat.FarmingFortune]: 7 };
	override skillReq = { [Skill.Farming]: 20, [Skill.Garden]: 6 };
}

export class BlossomCloak extends BaseItem {
	get skyblockId() {
		return 'BLOSSOM_CLOAK';
	}
	get name() {
		return 'Blossom Cloak';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Blossom_Cloak';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override family = 'LOTUS';
	override slot = GearSlot.Cloak;
	override baseStats = { [Stat.FarmingFortune]: 7 };
	override skillReq = { [Skill.Farming]: 10, [Skill.Garden]: 5 };
	override upgrade = {
		id: 'ZORROS_CAPE',
		reason: UpgradeReason.Situational,
		why: "A maxed Zorro's Cape provides significantly more fortune during a Jacob's contest, but slightly less outside of one.",
	};
}
