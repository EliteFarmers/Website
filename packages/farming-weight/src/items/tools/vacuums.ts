import { Rarity, ReforgeTarget } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import type { ToolGemSlot } from './gem-slots.js';

const VACUUM_WIKI = 'https://w.elitesb.gg/Vacuum';

const UNLOCKED_VACUUM_PERIDOT_SLOT: ToolGemSlot = {
	slot_type: 'PERIDOT',
	costs: [],
};

const PAID_VACUUM_PERIDOT_SLOT: ToolGemSlot = {
	slot_type: 'PERIDOT',
	costs: [
		{ type: 'ITEM', item_id: 'FINE_PERIDOT_GEM', amount: 20 },
		{ type: 'COINS', coins: 50_000 },
	],
};

abstract class VacuumItem extends BaseItem {
	override type = ReforgeTarget.Vacuum;

	protected constructor(
		private readonly itemId: string,
		private readonly itemName: string,
		private readonly rarity: Rarity,
		damage: number,
		fortune: number
	) {
		super();
		this.baseStats = {
			[Stat.Damage]: damage,
			[Stat.FarmingFortune]: fortune,
		};
	}

	get skyblockId() {
		return this.itemId;
	}

	get name() {
		return this.itemName;
	}

	get wiki() {
		return VACUUM_WIKI;
	}

	get maxRarity() {
		return this.rarity;
	}
}

export class SkyMartVacuum extends VacuumItem {
	constructor() {
		super('SKYMART_VACUUM', 'SkyMart Vacuum', Rarity.Common, 100, 5);
	}

	override upgrade = {
		id: 'SKYMART_TURBO_VACUUM',
		reason: UpgradeReason.NextTier,
		cost: { copper: 200 },
	};
}

export class SkyMartTurboVacuum extends VacuumItem {
	constructor() {
		super('SKYMART_TURBO_VACUUM', 'SkyMart Turbo Vacuum', Rarity.Uncommon, 120, 10);
	}

	override upgrade = {
		id: 'SKYMART_HYPER_VACUUM',
		reason: UpgradeReason.NextTier,
		cost: { copper: 500 },
	};
}

export class SkyMartHyperVacuum extends VacuumItem {
	constructor() {
		super('SKYMART_HYPER_VACUUM', 'SkyMart Hyper Vacuum', Rarity.Rare, 150, 15);
	}

	override upgrade = {
		id: 'INFINI_VACUUM',
		reason: UpgradeReason.NextTier,
		cost: { copper: 1_000 },
	};
}

export class InfiniVacuum extends VacuumItem {
	constructor() {
		super('INFINI_VACUUM', 'InfiniVacuum™', Rarity.Epic, 200, 20);
	}

	override gemSlots = [UNLOCKED_VACUUM_PERIDOT_SLOT];
	override upgrade = {
		id: 'INFINI_VACUUM_HOOVERIUS',
		reason: UpgradeReason.NextTier,
		cost: {
			copper: 2_500,
			items: {
				CHIRPING_STEREO: 1,
			},
		},
	};
}

export class InfiniVacuumHooverius extends VacuumItem {
	constructor() {
		super('INFINI_VACUUM_HOOVERIUS', 'InfiniVacuum™ Hooverius', Rarity.Legendary, 250, 25);
	}

	override gemSlots = [UNLOCKED_VACUUM_PERIDOT_SLOT, PAID_VACUUM_PERIDOT_SLOT];
}
