import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

const HELIANTHUS_GEM_SLOTS = [
	{
		slot_type: 'PERIDOT',
		costs: [
			{ type: 'ITEM' as const, item_id: 'FINE_PERIDOT_GEM', amount: 20 },
			{ type: 'COINS' as const, coins: 50000 },
		],
	},
	{
		slot_type: 'PERIDOT',
		costs: [
			{ type: 'ITEM' as const, item_id: 'FINE_PERIDOT_GEM', amount: 40 },
			{ type: 'COINS' as const, coins: 100000 },
		],
	},
];

export class HelianthusHelmet extends BaseItem {
	get skyblockId() {
		return 'HELIANTHUS_HELMET';
	}
	get name() {
		return 'Helianthus Helmet';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Helianthus_Armor';
	}
	get maxRarity() {
		return Rarity.Mythic;
	}

	override family = 'HELIANTHUS';
	override slot = GearSlot.Helmet;

	override baseStats = {
		[Stat.FarmingFortune]: 35,
		[Stat.BonusPestChance]: 20,
	};

	override skillReq = {
		[Skill.Farming]: 50,
	};

	override gemSlots = HELIANTHUS_GEM_SLOTS;
}

export class HelianthusChestplate extends BaseItem {
	get skyblockId() {
		return 'HELIANTHUS_CHESTPLATE';
	}
	get name() {
		return 'Helianthus Chestplate';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Helianthus_Armor';
	}
	get maxRarity() {
		return Rarity.Mythic;
	}

	override family = 'HELIANTHUS';
	override slot = GearSlot.Chestplate;

	override baseStats = {
		[Stat.FarmingFortune]: 40,
		[Stat.BonusPestChance]: 20,
	};

	override skillReq = {
		[Skill.Farming]: 50,
	};

	override gemSlots = HELIANTHUS_GEM_SLOTS;
}

export class HelianthusLeggings extends BaseItem {
	get skyblockId() {
		return 'HELIANTHUS_LEGGINGS';
	}
	get name() {
		return 'Helianthus Leggings';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Helianthus_Armor';
	}
	get maxRarity() {
		return Rarity.Mythic;
	}

	override family = 'HELIANTHUS';
	override slot = GearSlot.Leggings;

	override baseStats = {
		[Stat.FarmingFortune]: 40,
		[Stat.BonusPestChance]: 20,
	};

	override skillReq = {
		[Skill.Farming]: 50,
	};

	override gemSlots = HELIANTHUS_GEM_SLOTS;
}

export class HelianthusBoots extends BaseItem {
	get skyblockId() {
		return 'HELIANTHUS_BOOTS';
	}
	get name() {
		return 'Helianthus Boots';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Helianthus_Armor';
	}
	get maxRarity() {
		return Rarity.Mythic;
	}

	override family = 'HELIANTHUS';
	override slot = GearSlot.Boots;

	override baseStats = {
		[Stat.FarmingFortune]: 35,
		[Stat.BonusPestChance]: 20,
	};

	override skillReq = {
		[Skill.Farming]: 50,
	};

	override gemSlots = HELIANTHUS_GEM_SLOTS;
}
