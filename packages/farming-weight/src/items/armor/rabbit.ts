import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

abstract class RabbitArmorPiece extends BaseItem {
	override family = 'RABBIT';

	get wiki() {
		return 'https://w.elitesb.gg/Rabbit_Armor';
	}

	get maxRarity() {
		return Rarity.Common;
	}
}

export class RabbitHelmet extends RabbitArmorPiece {
	get skyblockId() {
		return 'RABBIT_HELMET';
	}
	get name() {
		return 'Rabbit Helmet';
	}
	override slot = GearSlot.Helmet;
	override baseStats = {
		[Stat.Defense]: 15,
		[Stat.Speed]: 5,
	};
}

export class RabbitChestplate extends RabbitArmorPiece {
	get skyblockId() {
		return 'RABBIT_CHESTPLATE';
	}
	get name() {
		return 'Rabbit Chestplate';
	}
	override slot = GearSlot.Chestplate;
	override baseStats = {
		[Stat.Defense]: 40,
		[Stat.Speed]: 5,
	};
}

export class RabbitLeggings extends RabbitArmorPiece {
	get skyblockId() {
		return 'RABBIT_LEGGINGS';
	}
	get name() {
		return 'Rabbit Leggings';
	}
	override slot = GearSlot.Leggings;
	override baseStats = {
		[Stat.Defense]: 30,
		[Stat.Speed]: 5,
	};
}

export class RabbitBoots extends RabbitArmorPiece {
	get skyblockId() {
		return 'RABBIT_BOOTS';
	}
	get name() {
		return 'Rabbit Boots';
	}
	override slot = GearSlot.Boots;
	override baseStats = {
		[Stat.Defense]: 15,
		[Stat.Speed]: 5,
	};
}
