import { Rarity } from '../../constants/reforges.js';
import { Skill } from '../../constants/skills.js';
import { SpecialCrop } from '../../constants/specialcrops.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';
import { armorTierGroup } from './groups.js';

const TATER_TO_CROPIE_GROUP = armorTierGroup('TATER', 'CROPIE');

export class MelonHelmet extends BaseItem {
	get skyblockId() {
		return 'MELON_HELMET';
	}
	get name() {
		return 'Tater Helmet';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Tater_Armor';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'MELON';
	override slot = GearSlot.Helmet;
	override special = [SpecialCrop.Cropie];

	override upgrade = {
		id: 'CROPIE_HELMET',
		reason: UpgradeReason.NextTier,
		group: TATER_TO_CROPIE_GROUP,
		cost: {
			items: {
				ENCHANTED_HAY_BALE: 8,
				BOX_OF_SEEDS: 6,
				CROPIE: 20,
			},
		},
	};

	override baseStats = {
		[Stat.Health]: 100,
		[Stat.Defense]: 25,
		[Stat.Speed]: 2,
		[Stat.FarmingFortune]: 15,
		[Stat.BonusPestChance]: 10,
	};

	override skillReq = {
		[Skill.Farming]: 20,
	};
}

export class MelonChestplate extends BaseItem {
	get skyblockId() {
		return 'MELON_CHESTPLATE';
	}
	get name() {
		return 'Tater Chestplate';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Tater_Armor';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'MELON';
	override slot = GearSlot.Chestplate;
	override special = [SpecialCrop.Cropie];

	override upgrade = {
		id: 'CROPIE_CHESTPLATE',
		reason: UpgradeReason.NextTier,
		group: TATER_TO_CROPIE_GROUP,
		cost: {
			items: {
				ENCHANTED_HAY_BALE: 8,
				BOX_OF_SEEDS: 6,
				CROPIE: 20,
				ENCHANTED_BAKED_POTATO: 45,
			},
		},
	};

	override baseStats = {
		[Stat.Health]: 150,
		[Stat.Defense]: 25,
		[Stat.Speed]: 3,
		[Stat.FarmingFortune]: 20,
		[Stat.BonusPestChance]: 10,
	};

	override skillReq = {
		[Skill.Farming]: 20,
	};
}

export class MelonLeggings extends BaseItem {
	get skyblockId() {
		return 'MELON_LEGGINGS';
	}
	get name() {
		return 'Tater Leggings';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Tater_Armor';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'MELON';
	override slot = GearSlot.Leggings;
	override special = [SpecialCrop.Cropie];

	override upgrade = {
		id: 'CROPIE_LEGGINGS',
		reason: UpgradeReason.NextTier,
		group: TATER_TO_CROPIE_GROUP,
		cost: {
			items: {
				ENCHANTED_HAY_BALE: 8,
				BOX_OF_SEEDS: 6,
				CROPIE: 20,
				ENCHANTED_GOLDEN_CARROT: 30,
			},
		},
	};

	override baseStats = {
		[Stat.Health]: 150,
		[Stat.Defense]: 25,
		[Stat.Speed]: 3,
		[Stat.FarmingFortune]: 20,
		[Stat.BonusPestChance]: 10,
	};

	override skillReq = {
		[Skill.Farming]: 20,
	};
}

export class MelonBoots extends BaseItem {
	get skyblockId() {
		return 'MELON_BOOTS';
	}
	get name() {
		return 'Tater Boots';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Tater_Armor';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'MELON';
	override slot = GearSlot.Boots;
	override special = [SpecialCrop.Cropie];

	override upgrade = {
		id: 'CROPIE_BOOTS',
		reason: UpgradeReason.NextTier,
		group: TATER_TO_CROPIE_GROUP,
		cost: {
			items: {
				ENCHANTED_HAY_BALE: 16,
				CROPIE: 20,
			},
		},
	};

	override baseStats = {
		[Stat.Health]: 100,
		[Stat.Defense]: 25,
		[Stat.Speed]: 2,
		[Stat.FarmingFortune]: 15,
		[Stat.BonusPestChance]: 10,
	};

	override skillReq = {
		[Skill.Farming]: 20,
	};
}
