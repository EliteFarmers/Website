import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

export class PesthuntersGloves extends BaseItem {
	get skyblockId() {
		return 'PESTHUNTERS_GLOVES';
	}
	get name() {
		return "Pesthunter's Gloves";
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Pesthunter%27s_Gloves';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'PESTHUNTERS';
	override slot = GearSlot.Gloves;
	override baseStats = {
		[Stat.BonusPestChance]: 5,
		[Stat.PestCooldownReduction]: 10,
	};
}

export class PesthuntersBelt extends BaseItem {
	get skyblockId() {
		return 'PESTHUNTERS_BELT';
	}
	get name() {
		return "Pesthunter's Belt";
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Pesthunter%27s_Belt';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'PESTHUNTERS';
	override slot = GearSlot.Belt;
	override baseStats = {
		[Stat.BonusPestChance]: 5,
		[Stat.PestCooldownReduction]: 10,
	};
}

export class PesthuntersNecklace extends BaseItem {
	get skyblockId() {
		return 'PESTHUNTERS_NECKLACE';
	}
	get name() {
		return "Pesthunter's Necklace";
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Pesthunter%27s_Necklace';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'PESTHUNTERS';
	override slot = GearSlot.Necklace;
	override baseStats = {
		[Stat.BonusPestChance]: 5,
		[Stat.PestCooldownReduction]: 10,
	};
}

export class PesthuntersCloak extends BaseItem {
	get skyblockId() {
		return 'PESTHUNTERS_CLOAK';
	}
	get name() {
		return "Pesthunter's Cloak";
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Pesthunter%27s_Cloak';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'PESTHUNTERS';
	override slot = GearSlot.Cloak;
	override baseStats = {
		[Stat.BonusPestChance]: 5,
		[Stat.PestCooldownReduction]: 10,
	};
	override upgrade = {
		id: 'PEST_VEST',
		reason: UpgradeReason.NextTier,
		why: 'The Pest Vest provides more fortune and a higher bonus pest chance.',
	};
}
