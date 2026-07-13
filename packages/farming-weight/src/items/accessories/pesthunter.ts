import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseAccessory } from './base.js';

function pesthunterStats(value: number) {
	return (options: { pesthunterAccessoryEnabled?: boolean }) =>
		options.pesthunterAccessoryEnabled === false ? {} : { [Stat.BonusPestChance]: value };
}

export class PesthunterRelic extends BaseAccessory {
	get skyblockId() {
		return 'PESTHUNTER_RELIC';
	}
	get name() {
		return 'Pesthunter Relic';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Pesthunter_Relic';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override family = 'Pesthunter';
	override familyOrder = 4;
	override computedStats = pesthunterStats(80);
}

export class PesthunterArtifact extends BaseAccessory {
	get skyblockId() {
		return 'PESTHUNTER_ARTIFACT';
	}
	get name() {
		return 'Pesthunter Artifact';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Pesthunter_Artifact';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override family = 'Pesthunter';
	override familyOrder = 3;
	override upgrade = {
		id: 'PESTHUNTER_RELIC',
		reason: UpgradeReason.NextTier,
	};
	override computedStats = pesthunterStats(60);
}

export class PesthunterRing extends BaseAccessory {
	get skyblockId() {
		return 'PESTHUNTER_RING';
	}
	get name() {
		return 'Pesthunter Ring';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Pesthunter_Ring';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override family = 'Pesthunter';
	override familyOrder = 2;
	override upgrade = {
		id: 'PESTHUNTER_ARTIFACT',
		reason: UpgradeReason.NextTier,
	};
	override computedStats = pesthunterStats(40);
}

export class PesthunterBadge extends BaseAccessory {
	get skyblockId() {
		return 'PESTHUNTER_BADGE';
	}
	get name() {
		return 'Pesthunter Badge';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Pesthunter_Badge';
	}
	get maxRarity() {
		return Rarity.Uncommon;
	}

	override family = 'Pesthunter';
	override familyOrder = 1;
	override upgrade = {
		id: 'PESTHUNTER_RING',
		reason: UpgradeReason.NextTier,
	};
	override computedStats = pesthunterStats(20);
}
