import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { SpecialCrop } from '../../constants/specialcrops.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

export class SquashHelmet extends BaseItem {
	get skyblockId() { return 'SQUASH_HELMET'; }
	get name() { return 'Squash Helmet'; }
	get wiki() { return 'https://wiki.hypixel.net/Squash_Armor'; }
	get maxRarity() { return Rarity.Rare; }

	override family = 'SQUASH';
	override slot = GearSlot.Helmet;
	override special = [SpecialCrop.Fermento];

	override upgrade = {
		id: 'FERMENTO_HELMET',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				CONDENSED_FERMENTO: 2,
				ENCHANTED_SUGAR_CANE: 32,
				ENCHANTED_HUGE_MUSHROOM_2: 32,
				ENCHANTED_HUGE_MUSHROOM_1: 32,
			},
		},
	};

	override baseStats = {
		[Stat.FarmingFortune]: 25,
		[Stat.BonusPestChance]: 15,
	};

	override skillReq = {
		[Skill.Farming]: 35,
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

export class SquashChestplate extends BaseItem {
	get skyblockId() { return 'SQUASH_CHESTPLATE'; }
	get name() { return 'Squash Chestplate'; }
	get wiki() { return 'https://wiki.hypixel.net/Squash_Armor'; }
	get maxRarity() { return Rarity.Rare; }

	override family = 'SQUASH';
	override slot = GearSlot.Chestplate;
	override special = [SpecialCrop.Fermento];

	override upgrade = {
		id: 'FERMENTO_CHESTPLATE',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				CONDENSED_FERMENTO: 2,
				ENCHANTED_SUGAR_CANE: 32,
				ENCHANTED_HUGE_MUSHROOM_2: 32,
				ENCHANTED_HUGE_MUSHROOM_1: 32,
				MUTANT_NETHER_STALK: 30,
				ENCHANTED_CACTUS: 25,
			},
		},
	};

	override baseStats = {
		[Stat.FarmingFortune]: 30,
		[Stat.BonusPestChance]: 15,
	};

	override skillReq = {
		[Skill.Farming]: 35,
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

export class SquashLeggings extends BaseItem {
	get skyblockId() { return 'SQUASH_LEGGINGS'; }
	get name() { return 'Squash Leggings'; }
	get wiki() { return 'https://wiki.hypixel.net/Squash_Armor'; }
	get maxRarity() { return Rarity.Rare; }

	override family = 'SQUASH';
	override slot = GearSlot.Leggings;
	override special = [SpecialCrop.Fermento];

	override upgrade = {
		id: 'FERMENTO_LEGGINGS',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				CONDENSED_FERMENTO: 2,
				ENCHANTED_SUGAR_CANE: 32,
				ENCHANTED_HUGE_MUSHROOM_2: 32,
				ENCHANTED_HUGE_MUSHROOM_1: 32,
				MUTANT_NETHER_STALK: 40,
			},
		},
	};

	override baseStats = {
		[Stat.FarmingFortune]: 30,
		[Stat.BonusPestChance]: 15,
	};

	override skillReq = {
		[Skill.Farming]: 35,
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

export class SquashBoots extends BaseItem {
	get skyblockId() { return 'SQUASH_BOOTS'; }
	get name() { return 'Squash Boots'; }
	get wiki() { return 'https://wiki.hypixel.net/Squash_Armor'; }
	get maxRarity() { return Rarity.Rare; }

	override family = 'SQUASH';
	override slot = GearSlot.Boots;
	override special = [SpecialCrop.Fermento];

	override upgrade = {
		id: 'FERMENTO_BOOTS',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				CONDENSED_FERMENTO: 2,
				ENCHANTED_HUGE_MUSHROOM_2: 32,
				ENCHANTED_HUGE_MUSHROOM_1: 32,
			},
		},
	};

	override baseStats = {
		[Stat.FarmingFortune]: 25,
		[Stat.BonusPestChance]: 15,
	};

	override skillReq = {
		[Skill.Farming]: 35,
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
