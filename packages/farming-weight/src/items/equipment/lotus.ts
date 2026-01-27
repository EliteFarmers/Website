import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

export class LotusBracelet extends BaseItem {
	get skyblockId() {
		return 'LOTUS_BRACELET';
	}
	get name() {
		return 'Lotus Bracelet';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Lotus_Bracelet';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'LOTUS';
	override slot = GearSlot.Gloves;
	override baseStats = { [Stat.FarmingFortune]: 5 };
	override skillReq = { [Skill.Farming]: 10, [Skill.Garden]: 2 };
	override upgrade = {
		id: 'BLOSSOM_BRACELET',
		reason: UpgradeReason.NextTier,
		cost: { copper: 2500 },
	};
}

export class LotusBelt extends BaseItem {
	get skyblockId() {
		return 'LOTUS_BELT';
	}
	get name() {
		return 'Lotus Belt';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Lotus_Belt';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'LOTUS';
	override slot = GearSlot.Belt;
	override baseStats = { [Stat.FarmingFortune]: 5 };
	override skillReq = { [Skill.Farming]: 10, [Skill.Garden]: 3 };
	override upgrade = {
		id: 'BLOSSOM_BELT',
		reason: UpgradeReason.NextTier,
		cost: { copper: 5000 },
	};
}

export class LotusNecklace extends BaseItem {
	get skyblockId() {
		return 'LOTUS_NECKLACE';
	}
	get name() {
		return 'Lotus Necklace';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Lotus_Necklace';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'LOTUS';
	override slot = GearSlot.Necklace;
	override baseStats = { [Stat.FarmingFortune]: 5 };
	override skillReq = { [Skill.Farming]: 10, [Skill.Garden]: 4 };
	override upgrade = {
		id: 'BLOSSOM_NECKLACE',
		reason: UpgradeReason.NextTier,
		cost: { copper: 7500 },
	};
}

export class LotusCloak extends BaseItem {
	get skyblockId() {
		return 'LOTUS_CLOAK';
	}
	get name() {
		return 'Lotus Cloak';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Lotus_Cloak';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'LOTUS';
	override slot = GearSlot.Cloak;
	override baseStats = { [Stat.FarmingFortune]: 5 };
	override skillReq = { [Skill.Farming]: 10, [Skill.Garden]: 5 };
	override upgrade = {
		id: 'BLOSSOM_CLOAK',
		reason: UpgradeReason.NextTier,
		cost: { copper: 10000 },
	};
}
