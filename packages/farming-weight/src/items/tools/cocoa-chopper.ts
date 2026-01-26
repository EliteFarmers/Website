import { Crop } from '../../constants/crops.js';
import { Rarity, ReforgeTarget } from '../../constants/reforges.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { T1_TOOL_GEMS, T2_TOOL_GEMS, T3_TOOL_GEMS } from './gem-slots.js';

export class CocoaChopper1 extends BaseItem {
	get skyblockId() {
		return 'COCO_CHOPPER';
	}
	get name() {
		return 'Cocoa Chopper Mk. I';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Cocoa_Chopper';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override crops = [Crop.CocoaBeans];
	override type = ReforgeTarget.Axe;
	override gemSlots = T1_TOOL_GEMS;
	override upgrade = {
		id: 'COCO_CHOPPER_2',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_COOKIE: 40,
				JACOBS_TICKET: 64,
			},
		},
	};
}

export class CocoaChopper2 extends BaseItem {
	get skyblockId() {
		return 'COCO_CHOPPER_2';
	}
	get name() {
		return 'Cocoa Chopper Mk. II';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Cocoa_Chopper';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override crops = [Crop.CocoaBeans];
	override type = ReforgeTarget.Axe;
	override gemSlots = T2_TOOL_GEMS;
	override upgrade = {
		id: 'COCO_CHOPPER_3',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				ENCHANTED_COOKIE: 160,
				JACOBS_TICKET: 256,
			},
		},
	};
}

export class CocoaChopper3 extends BaseItem {
	get skyblockId() {
		return 'COCO_CHOPPER_3';
	}
	get name() {
		return 'Cocoa Chopper Mk. III';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Cocoa_Chopper';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override crops = [Crop.CocoaBeans];
	override type = ReforgeTarget.Axe;
	override gemSlots = T3_TOOL_GEMS;
}
