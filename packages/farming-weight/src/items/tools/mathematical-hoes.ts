import { Crop } from '../../constants/crops.js';
import { Rarity } from '../../constants/reforges.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { FarmingToolType } from '../definitions.js';
import { T1_TOOL_GEMS, T2_TOOL_GEMS, T3_TOOL_GEMS } from './gem-slots.js';

// Gauss Carrot Hoe
export class GaussCarrotHoe1 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_CARROT_1';
	}
	get name() {
		return 'Gauss Carrot Hoe Mk. I';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Carrot_Hoe';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override crops = [Crop.Carrot];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T1_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_CARROT_2',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 64,
				ENCHANTED_GOLDEN_CARROT: 64,
			},
		},
	};
}

export class GaussCarrotHoe2 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_CARROT_2';
	}
	get name() {
		return 'Gauss Carrot Hoe Mk. II';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Carrot_Hoe';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override crops = [Crop.Carrot];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T2_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_CARROT_3',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 256,
				ENCHANTED_GOLDEN_CARROT: 256,
			},
		},
	};
}

export class GaussCarrotHoe3 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_CARROT_3';
	}
	get name() {
		return 'Gauss Carrot Hoe Mk. III';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Carrot_Hoe';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override crops = [Crop.Carrot];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T3_TOOL_GEMS;
}

// Newton Nether Warts Hoe
export class NewtonNetherWartsHoe1 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_WARTS_1';
	}
	get name() {
		return 'Newton Nether Warts Hoe Mk. I';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Newton_Nether_Wart_Hoe';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override crops = [Crop.NetherWart];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T1_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_WARTS_2',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 64,
				MUTANT_NETHER_STALK: 60,
			},
		},
	};
}

export class NewtonNetherWartsHoe2 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_WARTS_2';
	}
	get name() {
		return 'Newton Nether Warts Hoe Mk. II';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Newton_Nether_Wart_Hoe';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override crops = [Crop.NetherWart];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T2_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_WARTS_3',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 256,
				MUTANT_NETHER_STALK: 256,
			},
		},
	};
}

export class NewtonNetherWartsHoe3 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_WARTS_3';
	}
	get name() {
		return 'Newton Nether Warts Hoe Mk. III';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Newton_Nether_Wart_Hoe';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override crops = [Crop.NetherWart];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T3_TOOL_GEMS;
}

// Pythagorean Potato Hoe
export class PythagoreanPotatoHoe1 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_POTATO_1';
	}
	get name() {
		return 'Pythagorean Potato Hoe Mk. I';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Pythagorean_Potato_Hoe';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override crops = [Crop.Potato];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T1_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_POTATO_2',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 64,
				ENCHANTED_BAKED_POTATO: 60,
			},
		},
	};
}

export class PythagoreanPotatoHoe2 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_POTATO_2';
	}
	get name() {
		return 'Pythagorean Potato Hoe Mk. II';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Pythagorean_Potato_Hoe';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override crops = [Crop.Potato];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T2_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_POTATO_3',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 256,
				ENCHANTED_BAKED_POTATO: 256,
			},
		},
	};
}

export class PythagoreanPotatoHoe3 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_POTATO_3';
	}
	get name() {
		return 'Pythagorean Potato Hoe Mk. III';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Pythagorean_Potato_Hoe';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override crops = [Crop.Potato];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T3_TOOL_GEMS;
}

// Turing Sugar Cane Hoe
export class TuringSugarCaneHoe1 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_CANE_1';
	}
	get name() {
		return 'Turing Sugar Cane Hoe Mk. I';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Turing_Sugar_Cane_Hoe';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override crops = [Crop.SugarCane];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T1_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_CANE_2',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 64,
				ENCHANTED_SUGAR_CANE: 40,
			},
		},
	};
}

export class TuringSugarCaneHoe2 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_CANE_2';
	}
	get name() {
		return 'Turing Sugar Cane Hoe Mk. II';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Turing_Sugar_Cane_Hoe';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override crops = [Crop.SugarCane];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T2_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_CANE_3',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 256,
				ENCHANTED_SUGAR_CANE: 256,
			},
		},
	};
}

export class TuringSugarCaneHoe3 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_CANE_3';
	}
	get name() {
		return 'Turing Sugar Cane Hoe Mk. III';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Turing_Sugar_Cane_Hoe';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override crops = [Crop.SugarCane];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T3_TOOL_GEMS;
}

// Euclid's Wheat Hoe
export class EuclidsWheatHoe1 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_WHEAT_1';
	}
	get name() {
		return "Euclid's Wheat Hoe Mk. I";
	}
	get wiki() {
		return 'https://w.elitesb.gg/Wheat_Hoe';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override crops = [Crop.Wheat];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T1_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_WHEAT_2',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 64,
				ENCHANTED_HAY_BALE: 20,
			},
		},
	};
}

export class EuclidsWheatHoe2 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_WHEAT_2';
	}
	get name() {
		return "Euclid's Wheat Hoe Mk. II";
	}
	get wiki() {
		return 'https://w.elitesb.gg/Wheat_Hoe';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override crops = [Crop.Wheat];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T2_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_WHEAT_3',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 256,
				ENCHANTED_HAY_BALE: 256,
			},
		},
	};
}

export class EuclidsWheatHoe3 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_WHEAT_3';
	}
	get name() {
		return "Euclid's Wheat Hoe Mk. III";
	}
	get wiki() {
		return 'https://w.elitesb.gg/Wheat_Hoe';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override crops = [Crop.Wheat];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T3_TOOL_GEMS;
}

// Eclipse Hoe (Sunflower/Moonflower)
export class EclipseHoe1 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_SUNFLOWER_1';
	}
	get name() {
		return 'Eclipse Hoe Mk. I';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Eclipse_Hoe';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override crops = [Crop.Sunflower, Crop.Moonflower];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T1_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_SUNFLOWER_2',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 64,
				COMPACTED_SUNFLOWER: 20,
				COMPACTED_MOONFLOWER: 20,
			},
		},
	};
}

export class EclipseHoe2 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_SUNFLOWER_2';
	}
	get name() {
		return 'Eclipse Hoe Mk. II';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Eclipse_Hoe';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override crops = [Crop.Sunflower, Crop.Moonflower];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T2_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_SUNFLOWER_3',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 256,
				COMPACTED_SUNFLOWER: 80,
				COMPACTED_MOONFLOWER: 80,
			},
		},
	};
}

export class EclipseHoe3 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_SUNFLOWER_3';
	}
	get name() {
		return 'Eclipse Hoe Mk. III';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Eclipse_Hoe';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override crops = [Crop.Sunflower, Crop.Moonflower];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T3_TOOL_GEMS;
}

// Wild Rose Hoe
export class WildRoseHoe1 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_WILD_ROSE_1';
	}
	get name() {
		return 'Wild Rose Hoe Mk. I';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Wild_Rose_Hoe';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override crops = [Crop.WildRose];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T1_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_WILD_ROSE_2',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 64,
				COMPACTED_WILD_ROSE: 40,
			},
		},
	};
}

export class WildRoseHoe2 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_WILD_ROSE_2';
	}
	get name() {
		return 'Wild Rose Hoe Mk. II';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Wild_Rose_Hoe';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override crops = [Crop.WildRose];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T2_TOOL_GEMS;
	override upgrade = {
		id: 'THEORETICAL_HOE_WILD_ROSE_3',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				JACOBS_TICKET: 256,
				COMPACTED_WILD_ROSE: 160,
			},
		},
	};
}

export class WildRoseHoe3 extends BaseItem {
	get skyblockId() {
		return 'THEORETICAL_HOE_WILD_ROSE_3';
	}
	get name() {
		return 'Wild Rose Hoe Mk. III';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Wild_Rose_Hoe';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override crops = [Crop.WildRose];
	override type = FarmingToolType.MathematicalHoe;
	override gemSlots = T3_TOOL_GEMS;
}
