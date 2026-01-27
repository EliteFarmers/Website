import { Crop } from '../../constants/crops.js';
import { ITEM_IDS } from '../../constants/itemids.js';
import { Rarity } from '../../constants/reforges.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { FarmingToolType } from '../definitions.js';
import { T1_TOOL_GEMS, T2_TOOL_GEMS, T3_TOOL_GEMS } from './gem-slots.js';

// Melon Dicer
export class MelonDicer1 extends BaseItem {
	get skyblockId() {
		return 'MELON_DICER';
	}
	get name() {
		return 'Melon Dicer Mk. I';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Melon_Dicer';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override crops = [Crop.Melon];
	override type = FarmingToolType.Dicer;
	override gemSlots = T1_TOOL_GEMS;
	override upgrade = {
		id: 'MELON_DICER_2',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				[ITEM_IDS.EnchantedMelonBlock]: 64,
				[ITEM_IDS.JacobsTicket]: 64,
			},
		},
	};
}

export class MelonDicer2 extends BaseItem {
	get skyblockId() {
		return 'MELON_DICER_2';
	}
	get name() {
		return 'Melon Dicer Mk. II';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Melon_Dicer_2.0';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override crops = [Crop.Melon];
	override type = FarmingToolType.Dicer;
	override gemSlots = T2_TOOL_GEMS;
	override upgrade = {
		id: 'MELON_DICER_3',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				[ITEM_IDS.EnchantedMelonBlock]: 256,
				[ITEM_IDS.JacobsTicket]: 256,
			},
		},
	};
}

export class MelonDicer3 extends BaseItem {
	get skyblockId() {
		return 'MELON_DICER_3';
	}
	get name() {
		return 'Melon Dicer Mk. III';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Melon_Dicer_3.0';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override crops = [Crop.Melon];
	override type = FarmingToolType.Dicer;
	override gemSlots = T3_TOOL_GEMS;
}

// Pumpkin Dicer
export class PumpkinDicer1 extends BaseItem {
	get skyblockId() {
		return 'PUMPKIN_DICER';
	}
	get name() {
		return 'Pumpkin Dicer Mk. I';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Pumpkin_Dicer';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override crops = [Crop.Pumpkin];
	override type = FarmingToolType.Dicer;
	override gemSlots = T1_TOOL_GEMS;
	override upgrade = {
		id: 'PUMPKIN_DICER_2',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				[ITEM_IDS.PolishedPumpkin]: 20,
				[ITEM_IDS.JacobsTicket]: 64,
			},
		},
	};
}

export class PumpkinDicer2 extends BaseItem {
	get skyblockId() {
		return 'PUMPKIN_DICER_2';
	}
	get name() {
		return 'Pumpkin Dicer Mk. II';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Pumpkin_Dicer_2.0';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override crops = [Crop.Pumpkin];
	override type = FarmingToolType.Dicer;
	override gemSlots = T2_TOOL_GEMS;
	override upgrade = {
		id: 'PUMPKIN_DICER_3',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				[ITEM_IDS.PolishedPumpkin]: 80,
				[ITEM_IDS.JacobsTicket]: 256,
			},
		},
	};
}

export class PumpkinDicer3 extends BaseItem {
	get skyblockId() {
		return 'PUMPKIN_DICER_3';
	}
	get name() {
		return 'Pumpkin Dicer Mk. III';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Pumpkin_Dicer_3.0';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override crops = [Crop.Pumpkin];
	override type = FarmingToolType.Dicer;
	override gemSlots = T3_TOOL_GEMS;
}
