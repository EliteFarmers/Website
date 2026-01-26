import { Crop } from '../../constants/crops.js';
import { ITEM_IDS } from '../../constants/itemids.js';
import { Rarity, ReforgeTarget } from '../../constants/reforges.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { T1_TOOL_GEMS, T2_TOOL_GEMS, T3_TOOL_GEMS } from './gem-slots.js';

export class FungiCutter1 extends BaseItem {
	get skyblockId() {
		return 'FUNGI_CUTTER';
	}
	get name() {
		return 'Fungi Cutter Mk. I';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Fungi_Cutter';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override crops = [Crop.Mushroom];
	override type = ReforgeTarget.Hoe;
	override gemSlots = T1_TOOL_GEMS;
	override upgrade = {
		id: 'FUNGI_CUTTER_2',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				[ITEM_IDS.EnchantedBrownMushroomBlock]: 10,
				[ITEM_IDS.EnchantedRedMushroomBlock]: 10,
				JACOBS_TICKET: 64,
			},
		},
	};
}

export class FungiCutter2 extends BaseItem {
	get skyblockId() {
		return 'FUNGI_CUTTER_2';
	}
	get name() {
		return 'Fungi Cutter Mk. II';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Fungi_Cutter';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override crops = [Crop.Mushroom];
	override type = ReforgeTarget.Hoe;
	override gemSlots = T2_TOOL_GEMS;
	override upgrade = {
		id: 'FUNGI_CUTTER_3',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				[ITEM_IDS.EnchantedBrownMushroomBlock]: 40,
				[ITEM_IDS.EnchantedRedMushroomBlock]: 40,
				JACOBS_TICKET: 256,
			},
		},
	};
}

export class FungiCutter3 extends BaseItem {
	get skyblockId() {
		return 'FUNGI_CUTTER_3';
	}
	get name() {
		return 'Fungi Cutter Mk. III';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Fungi_Cutter';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override crops = [Crop.Mushroom];
	override type = ReforgeTarget.Hoe;
	override gemSlots = T3_TOOL_GEMS;
}
