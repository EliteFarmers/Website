import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { SpecialCrop } from '../../constants/specialcrops.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

const FERMENTO_SPECIAL = [SpecialCrop.Cropie, SpecialCrop.Squash, SpecialCrop.Fermento, SpecialCrop.Helianthus];

const FERMENTO_GEM_SLOTS = [
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

export class FermentoHelmet extends BaseItem {
	get skyblockId() {
		return 'FERMENTO_HELMET';
	}
	get name() {
		return 'Fermento Helmet';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Fermento_Armor';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override family = 'FERMENTO';
	override slot = GearSlot.Helmet;
	override special = FERMENTO_SPECIAL;

	override upgrade = {
		id: 'HELIANTHUS_HELMET',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				COMPACTED_WILD_ROSE: 64,
				COMPACTED_MOONFLOWER: 64,
				COMPACTED_SUNFLOWER: 64,
				CONDENSED_HELIANTHUS: 2,
			},
		},
	};

	override baseStats = {
		[Stat.FarmingFortune]: 30,
		[Stat.BonusPestChance]: 17.5,
	};

	override skillReq = {
		[Skill.Farming]: 40,
	};

	override gemSlots = FERMENTO_GEM_SLOTS;
}

export class FermentoChestplate extends BaseItem {
	get skyblockId() {
		return 'FERMENTO_CHESTPLATE';
	}
	get name() {
		return 'Fermento Chestplate';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Fermento_Armor';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override family = 'FERMENTO';
	override slot = GearSlot.Chestplate;
	override special = FERMENTO_SPECIAL;

	override upgrade = {
		id: 'HELIANTHUS_CHESTPLATE',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				COMPACTED_WILD_ROSE: 64,
				COMPACTED_MOONFLOWER: 64,
				COMPACTED_SUNFLOWER: 64,
				CONDENSED_HELIANTHUS: 2,
			},
		},
	};

	override baseStats = {
		[Stat.FarmingFortune]: 35,
		[Stat.BonusPestChance]: 17.5,
	};

	override skillReq = {
		[Skill.Farming]: 40,
	};

	override gemSlots = FERMENTO_GEM_SLOTS;
}

export class FermentoLeggings extends BaseItem {
	get skyblockId() {
		return 'FERMENTO_LEGGINGS';
	}
	get name() {
		return 'Fermento Leggings';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Fermento_Armor';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override family = 'FERMENTO';
	override slot = GearSlot.Leggings;
	override special = FERMENTO_SPECIAL;

	override upgrade = {
		id: 'HELIANTHUS_LEGGINGS',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				COMPACTED_WILD_ROSE: 64,
				COMPACTED_MOONFLOWER: 64,
				COMPACTED_SUNFLOWER: 64,
				CONDENSED_HELIANTHUS: 2,
			},
		},
	};

	override baseStats = {
		[Stat.FarmingFortune]: 35,
		[Stat.BonusPestChance]: 17.5,
	};

	override skillReq = {
		[Skill.Farming]: 40,
	};

	override gemSlots = FERMENTO_GEM_SLOTS;
}

export class FermentoBoots extends BaseItem {
	get skyblockId() {
		return 'FERMENTO_BOOTS';
	}
	get name() {
		return 'Fermento Boots';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Fermento_Armor';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override family = 'FERMENTO';
	override slot = GearSlot.Boots;
	override special = FERMENTO_SPECIAL;

	override upgrade = {
		id: 'HELIANTHUS_BOOTS',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				COMPACTED_MOONFLOWER: 64,
				COMPACTED_SUNFLOWER: 64,
				CONDENSED_HELIANTHUS: 2,
			},
		},
	};

	override baseStats = {
		[Stat.FarmingFortune]: 30,
		[Stat.BonusPestChance]: 17.5,
	};

	override skillReq = {
		[Skill.Farming]: 40,
	};

	override gemSlots = FERMENTO_GEM_SLOTS;
}
