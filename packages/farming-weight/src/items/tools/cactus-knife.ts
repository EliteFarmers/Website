import { Crop } from '../../constants/crops.js';
import { Rarity, ReforgeTarget } from '../../constants/reforges.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { T1_TOOL_GEMS, T2_TOOL_GEMS, T3_TOOL_GEMS } from './gem-slots.js';

export class CactusKnife1 extends BaseItem {
	get skyblockId() {
		return 'CACTUS_KNIFE';
	}
	get name() {
		return 'Cactus Knife Mk. I';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Cactus_Knife';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override crops = [Crop.Cactus];
	override type = ReforgeTarget.Hoe;
	override gemSlots = T1_TOOL_GEMS;
	override upgrade = {
		id: 'CACTUS_KNIFE_2',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_CACTUS: 32,
				JACOBS_TICKET: 64,
			},
		},
	};
}

export class CactusKnife2 extends BaseItem {
	get skyblockId() {
		return 'CACTUS_KNIFE_2';
	}
	get name() {
		return 'Cactus Knife Mk. II';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Cactus_Knife';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override crops = [Crop.Cactus];
	override type = ReforgeTarget.Hoe;
	override gemSlots = T2_TOOL_GEMS;
	override upgrade = {
		id: 'CACTUS_KNIFE_3',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_CACTUS: 128,
				JACOBS_TICKET: 256,
			},
		},
	};
}

export class CactusKnife3 extends BaseItem {
	get skyblockId() {
		return 'CACTUS_KNIFE_3';
	}
	get name() {
		return 'Cactus Knife Mk. III';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Cactus_Knife';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override crops = [Crop.Cactus];
	override type = ReforgeTarget.Hoe;
	override gemSlots = T3_TOOL_GEMS;
}
