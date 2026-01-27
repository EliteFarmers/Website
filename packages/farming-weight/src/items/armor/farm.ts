import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import type { GemSlotCost } from '../../fortune/upgradeable.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

const FARM_ARMOR_GEM_SLOTS: { slot_type: string; costs: GemSlotCost[] }[] = [
	{
		slot_type: 'PERIDOT',
		costs: [],
	},
	{
		slot_type: 'PERIDOT',
		costs: [
			{ type: 'ITEM' as const, item_id: 'FINE_PERIDOT_GEM', amount: 20 },
			{ type: 'COINS' as const, coins: 50000 },
		],
	},
];

export class FarmArmorHelmet extends BaseItem {
	get skyblockId() {
		return 'FARM_ARMOR_HELMET';
	}
	get name() {
		return 'Farm Armor Helmet';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Farm_Armor';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'FARM_ARMOR';
	override slot = GearSlot.Helmet;
	override gemSlots = FARM_ARMOR_GEM_SLOTS;

	override upgrade = {
		id: 'MELON_HELMET',
		reason: UpgradeReason.DeadEnd,
	};

	override baseStats = {
		[Stat.FarmingFortune]: 10,
	};

	override skillReq = {
		[Skill.Farming]: 10,
	};
}

export class FarmArmorChestplate extends BaseItem {
	get skyblockId() {
		return 'FARM_ARMOR_CHESTPLATE';
	}
	get name() {
		return 'Farm Armor Chestplate';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Farm_Armor';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'FARM_ARMOR';
	override slot = GearSlot.Chestplate;
	override gemSlots = FARM_ARMOR_GEM_SLOTS;

	override upgrade = {
		id: 'MELON_CHESTPLATE',
		reason: UpgradeReason.DeadEnd,
	};

	override baseStats = {
		[Stat.FarmingFortune]: 10,
	};

	override skillReq = {
		[Skill.Farming]: 10,
	};
}

export class FarmArmorLeggings extends BaseItem {
	get skyblockId() {
		return 'FARM_ARMOR_LEGGINGS';
	}
	get name() {
		return 'Farm Armor Leggings';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Farm_Armor';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'FARM_ARMOR';
	override slot = GearSlot.Leggings;
	override gemSlots = FARM_ARMOR_GEM_SLOTS;

	override upgrade = {
		id: 'MELON_LEGGINGS',
		reason: UpgradeReason.DeadEnd,
	};

	override baseStats = {
		[Stat.FarmingFortune]: 10,
	};

	override skillReq = {
		[Skill.Farming]: 10,
	};
}

export class FarmArmorBoots extends BaseItem {
	get skyblockId() {
		return 'FARM_ARMOR_BOOTS';
	}
	get name() {
		return 'Farm Armor Boots';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Farm_Armor';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'FARM_ARMOR';
	override slot = GearSlot.Boots;
	override gemSlots = FARM_ARMOR_GEM_SLOTS;

	override upgrade = {
		id: 'MELON_BOOTS',
		reason: UpgradeReason.DeadEnd,
	};

	override baseStats = {
		[Stat.FarmingFortune]: 10,
	};

	override skillReq = {
		[Skill.Farming]: 10,
	};
}
