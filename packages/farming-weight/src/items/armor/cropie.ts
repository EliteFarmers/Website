import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { SpecialCrop } from '../../constants/specialcrops.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

export class CropieHelmet extends BaseItem {
	get skyblockId() {
		return 'CROPIE_HELMET';
	}
	get name() {
		return 'Cropie Helmet';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Cropie_Armor';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'CROPIE';
	override slot = GearSlot.Helmet;
	override special = [SpecialCrop.Squash];

	override upgrade = {
		id: 'SQUASH_HELMET',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				SQUASH: 20,
				POLISHED_PUMPKIN: 8,
				ENCHANTED_MELON_BLOCK: 48,
			},
		},
	};

	override baseStats = {
		[Stat.FarmingFortune]: 20,
		[Stat.BonusPestChance]: 12.5,
	};

	override skillReq = {
		[Skill.Farming]: 30,
	};

	override gemSlots = [
		{
			slot_type: 'PERIDOT',
			costs: [
				{ type: 'ITEM' as const, item_id: 'FINE_PERIDOT_GEM', amount: 20 },
				{ type: 'COINS' as const, coins: 50000 },
			],
		},
	];
}

export class CropieChestplate extends BaseItem {
	get skyblockId() {
		return 'CROPIE_CHESTPLATE';
	}
	get name() {
		return 'Cropie Chestplate';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Cropie_Armor';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'CROPIE';
	override slot = GearSlot.Chestplate;
	override special = [SpecialCrop.Squash];

	override upgrade = {
		id: 'SQUASH_CHESTPLATE',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				SQUASH: 20,
				POLISHED_PUMPKIN: 8,
				ENCHANTED_MELON_BLOCK: 48,
				ENCHANTED_COOKIE: 30,
			},
		},
	};

	override baseStats = {
		[Stat.FarmingFortune]: 25,
		[Stat.BonusPestChance]: 12.5,
	};

	override skillReq = {
		[Skill.Farming]: 30,
	};

	override gemSlots = [
		{
			slot_type: 'PERIDOT',
			costs: [
				{ type: 'ITEM' as const, item_id: 'FINE_PERIDOT_GEM', amount: 20 },
				{ type: 'COINS' as const, coins: 50000 },
			],
		},
	];
}

export class CropieLeggings extends BaseItem {
	get skyblockId() {
		return 'CROPIE_LEGGINGS';
	}
	get name() {
		return 'Cropie Leggings';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Cropie_Armor';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'CROPIE';
	override slot = GearSlot.Leggings;
	override special = [SpecialCrop.Squash];

	override upgrade = {
		id: 'SQUASH_LEGGINGS',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				SQUASH: 20,
				POLISHED_PUMPKIN: 8,
				ENCHANTED_MELON_BLOCK: 48,
				ENCHANTED_COOKIE: 20,
			},
		},
	};

	override baseStats = {
		[Stat.FarmingFortune]: 25,
		[Stat.BonusPestChance]: 12.5,
	};

	override skillReq = {
		[Skill.Farming]: 30,
	};

	override gemSlots = [
		{
			slot_type: 'PERIDOT',
			costs: [
				{ type: 'ITEM' as const, item_id: 'FINE_PERIDOT_GEM', amount: 20 },
				{ type: 'COINS' as const, coins: 50000 },
			],
		},
	];
}

export class CropieBoots extends BaseItem {
	get skyblockId() {
		return 'CROPIE_BOOTS';
	}
	get name() {
		return 'Cropie Boots';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Cropie_Armor';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'CROPIE';
	override slot = GearSlot.Boots;
	override special = [SpecialCrop.Squash];

	override upgrade = {
		id: 'SQUASH_BOOTS',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				SQUASH: 20,
				POLISHED_PUMPKIN: 12,
			},
		},
	};

	override baseStats = {
		[Stat.FarmingFortune]: 20,
		[Stat.BonusPestChance]: 12.5,
	};

	override skillReq = {
		[Skill.Farming]: 30,
	};

	override gemSlots = [
		{
			slot_type: 'PERIDOT',
			costs: [
				{ type: 'ITEM' as const, item_id: 'FINE_PERIDOT_GEM', amount: 20 },
				{ type: 'COINS' as const, coins: 50000 },
			],
		},
	];
}
