import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseAccessory } from './base.js';

export class HelianthusRelic extends BaseAccessory {
	get skyblockId() {
		return 'HELIANTHUS_RELIC';
	}
	get name() {
		return 'Helianthus Relic';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Helianthus_Relic';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override family = 'Fermento';
	override familyOrder = 4;
	override baseStats = {
		[Stat.FarmingFortune]: 40,
	};
}

export class FermentoArtifact extends BaseAccessory {
	get skyblockId() {
		return 'FERMENTO_ARTIFACT';
	}
	get name() {
		return 'Fermento Artifact';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Fermento_Artifact';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override family = 'Fermento';
	override familyOrder = 3;
	override upgrade = {
		id: 'HELIANTHUS_RELIC',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				CONDENSED_HELIANTHUS: 8,
			},
		},
	};
	override baseStats = {
		[Stat.WheatFortune]: 30,
		[Stat.CarrotFortune]: 30,
		[Stat.PotatoFortune]: 30,
		[Stat.PumpkinFortune]: 30,
		[Stat.MelonFortune]: 30,
		[Stat.MushroomFortune]: 30,
		[Stat.CocoaBeanFortune]: 30,
		[Stat.NetherWartFortune]: 30,
		[Stat.CactusFortune]: 30,
		[Stat.SugarCaneFortune]: 30,
	};
}

export class SquashRing extends BaseAccessory {
	get skyblockId() {
		return 'SQUASH_RING';
	}
	get name() {
		return 'Squash Ring';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Squash_Ring';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'Fermento';
	override familyOrder = 2;
	override upgrade = {
		id: 'FERMENTO_ARTIFACT',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				CONDENSED_FERMENTO: 8,
			},
		},
	};
	override baseStats = {
		[Stat.WheatFortune]: 20,
		[Stat.CarrotFortune]: 20,
		[Stat.PotatoFortune]: 20,
		[Stat.PumpkinFortune]: 20,
		[Stat.MelonFortune]: 20,
		[Stat.MushroomFortune]: 20,
		[Stat.CocoaBeanFortune]: 20,
	};
}

export class CropieTalisman extends BaseAccessory {
	get skyblockId() {
		return 'CROPIE_TALISMAN';
	}
	get name() {
		return 'Cropie Talisman';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Cropie_Talisman';
	}
	get maxRarity() {
		return Rarity.Common;
	}

	override family = 'Fermento';
	override familyOrder = 1;
	override upgrade = {
		id: 'SQUASH_RING',
		reason: UpgradeReason.NextTier,
		cost: {
			items: {
				SQUASH: 128,
			},
		},
	};
	override baseStats = {
		[Stat.WheatFortune]: 10,
		[Stat.CarrotFortune]: 10,
		[Stat.PotatoFortune]: 10,
	};
}
