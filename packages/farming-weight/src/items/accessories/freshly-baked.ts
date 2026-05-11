import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import type { PlayerOptions } from '../../player/playeroptions.js';
import { BaseAccessory } from './base.js';

abstract class FreshlyBakedAccessory extends BaseAccessory {
	override family = 'FreshlyBaked';

	protected abstract readonly overbloom: number;

	override computedStats = (opt: PlayerOptions) => ({
		[Stat.Overbloom]: this.overbloom * (opt.harvestFeast?.active ? 2 : 1),
	});
}

export class FreshlyBakedHeirloom extends FreshlyBakedAccessory {
	protected readonly overbloom = 5;

	get skyblockId() {
		return 'FRESHLY_BAKED_HEIRLOOM';
	}
	get name() {
		return 'Freshly Baked Heirloom';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Freshly_Baked_Heirloom';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override familyOrder = 5;
}

export class FreshlyBakedRelic extends FreshlyBakedAccessory {
	protected readonly overbloom = 4;

	get skyblockId() {
		return 'FRESHLY_BAKED_RELIC';
	}
	get name() {
		return 'Freshly Baked Relic';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Freshly_Baked_Relic';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override familyOrder = 4;
	override upgrade = {
		id: 'FRESHLY_BAKED_HEIRLOOM',
		reason: UpgradeReason.NextTier,
		cost: {
			kernels: 1000,
		},
	};
}

export class FreshlyBakedArtifact extends FreshlyBakedAccessory {
	protected readonly overbloom = 3;

	get skyblockId() {
		return 'FRESHLY_BAKED_ARTIFACT';
	}
	get name() {
		return 'Freshly Baked Artifact';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Freshly_Baked_Artifact';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override familyOrder = 3;
	override upgrade = {
		id: 'FRESHLY_BAKED_RELIC',
		reason: UpgradeReason.NextTier,
		cost: {
			kernels: 500,
		},
	};
}

export class FreshlyBakedRing extends FreshlyBakedAccessory {
	protected readonly overbloom = 2;

	get skyblockId() {
		return 'FRESHLY_BAKED_RING';
	}
	get name() {
		return 'Freshly Baked Ring';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Freshly_Baked_Ring';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override familyOrder = 2;
	override upgrade = {
		id: 'FRESHLY_BAKED_ARTIFACT',
		reason: UpgradeReason.NextTier,
		cost: {
			kernels: 250,
		},
	};
}

export class FreshlyBakedTalisman extends FreshlyBakedAccessory {
	protected readonly overbloom = 1;

	get skyblockId() {
		return 'FRESHLY_BAKED_TALISMAN';
	}
	get name() {
		return 'Freshly Baked Talisman';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Freshly_Baked_Talisman';
	}
	get maxRarity() {
		return Rarity.Common;
	}

	override familyOrder = 1;
	override upgrade = {
		id: 'FRESHLY_BAKED_RING',
		reason: UpgradeReason.NextTier,
		cost: {
			kernels: 100,
		},
	};
}
