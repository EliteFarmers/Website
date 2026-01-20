import { Rarity, ReforgeTarget } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

export class FarmerBoots extends BaseItem {
	get skyblockId() { return 'FARMER_BOOTS'; }
	get name() { return 'Farmer Boots'; }
	get wiki() { return 'https://wiki.hypixel.net/Farmer_Boots'; }
	get maxRarity() { return Rarity.Rare; }

	override slot = GearSlot.Boots;

	override upgrade = {
		id: 'MELON_BOOTS',
		reason: UpgradeReason.DeadEnd,
		why: 'You can control your speed with the sundial on the Garden!',
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

	override skillReq = {
		[Skill.Farming]: 18,
	};

	override perLevelStats = {
		skill: Skill.Farming,
		stats: {
			[Stat.FarmingFortune]: 1,
		},
	};
}

export class RanchersBoots extends BaseItem {
	get skyblockId() { return 'RANCHERS_BOOTS'; }
	get name() { return "Rancher's Boots"; }
	get wiki() { return 'https://wiki.hypixel.net/Rancher%27s_Boots'; }
	get maxRarity() { return Rarity.Legendary; }

	override slot = GearSlot.Boots;

	override upgrade = {
		id: 'FERMENTO_BOOTS',
		reason: UpgradeReason.DeadEnd,
		why: 'Fermento Boots provide better overall stats! Your speed is still controllable with the sundial on the Garden.',
	};

	override gemSlots = [
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

	override skillReq = {
		[Skill.Farming]: 21,
	};

	override perLevelStats = {
		skill: Skill.Farming,
		stats: {
			[Stat.FarmingFortune]: 1,
		},
	};
}

export class LanternHelmet extends BaseItem {
	get skyblockId() { return 'ENCHANTED_JACK_O_LANTERN'; }
	get name() { return 'Lantern Helmet'; }
	get wiki() { return 'https://wiki.hypixel.net/Lantern_Helmet'; }
	get maxRarity() { return Rarity.Rare; }

	override slot = GearSlot.Helmet;

	override upgrade = {
		id: 'FERMENTO_HELMET',
		reason: UpgradeReason.DeadEnd,
	};

	override gemSlots = [
		{
			slot_type: 'PERIDOT',
			costs: [] as { type: 'ITEM' | 'COINS'; item_id?: string; amount?: number; coins?: number }[],
		},
		{
			slot_type: 'PERIDOT',
			costs: [
				{ type: 'ITEM' as const, item_id: 'FINE_PERIDOT_GEM', amount: 20 },
				{ type: 'COINS' as const, coins: 50000 },
			],
		},
	];

	override skillReq = {
		[Skill.Farming]: 15,
	};

	override perLevelStats = {
		skill: Skill.Farming,
		appliesTo: [ReforgeTarget.Axe],
		stats: {
			[Stat.FarmingFortune]: 1,
		},
	};
}
