import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import type { GemSlotCost } from '../../fortune/upgradeable.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

const RABBIT_GEM_SLOTS: { slot_type: string; costs: GemSlotCost[] }[] = [
	{
		slot_type: 'PERIDOT',
		costs: [],
	},
];

export class RabbitHelmet extends BaseItem {
	get skyblockId() {
		return 'RABBIT_HELMET';
	}
	get name() {
		return 'Rabbit Helmet';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Rabbit_Armor';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'RABBIT';
	override slot = GearSlot.Helmet;
	override gemSlots = RABBIT_GEM_SLOTS;

	override upgrade = {
		id: 'MELON_HELMET',
		reason: UpgradeReason.DeadEnd,
	};

	override baseStats = {
		[Stat.FarmingFortune]: 15,
	};

	override skillReq = {
		[Skill.Farming]: 15,
	};
}

export class RabbitChestplate extends BaseItem {
	get skyblockId() {
		return 'RABBIT_CHESTPLATE';
	}
	get name() {
		return 'Rabbit Chestplate';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Rabbit_Armor';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'RABBIT';
	override slot = GearSlot.Chestplate;
	override gemSlots = RABBIT_GEM_SLOTS;

	override upgrade = {
		id: 'MELON_CHESTPLATE',
		reason: UpgradeReason.DeadEnd,
	};

	override baseStats = {
		[Stat.FarmingFortune]: 15,
	};

	override skillReq = {
		[Skill.Farming]: 15,
	};
}

export class RabbitLeggings extends BaseItem {
	get skyblockId() {
		return 'RABBIT_LEGGINGS';
	}
	get name() {
		return 'Rabbit Leggings';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Rabbit_Armor';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'RABBIT';
	override slot = GearSlot.Leggings;
	override gemSlots = RABBIT_GEM_SLOTS;

	override upgrade = {
		id: 'MELON_LEGGINGS',
		reason: UpgradeReason.DeadEnd,
	};

	override baseStats = {
		[Stat.FarmingFortune]: 15,
	};

	override skillReq = {
		[Skill.Farming]: 15,
	};
}

export class RabbitBoots extends BaseItem {
	get skyblockId() {
		return 'RABBIT_BOOTS';
	}
	get name() {
		return 'Rabbit Boots';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Rabbit_Armor';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'RABBIT';
	override slot = GearSlot.Boots;
	override gemSlots = RABBIT_GEM_SLOTS;

	override upgrade = {
		id: 'MELON_BOOTS',
		reason: UpgradeReason.DeadEnd,
	};

	override baseStats = {
		[Stat.FarmingFortune]: 15,
	};

	override skillReq = {
		[Skill.Farming]: 15,
	};
}
