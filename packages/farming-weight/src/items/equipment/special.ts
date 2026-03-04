import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { UpgradeReason } from '../../constants/upgrades.js';
import { BaseItem } from '../base-item.js';
import { GearSlot } from '../definitions.js';

export class ZorrosCape extends BaseItem {
	get skyblockId() {
		return 'ZORROS_CAPE';
	}
	get name() {
		return "Zorro's Cape";
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Zorro%27s_Cape';
	}
	get maxRarity() {
		return Rarity.Mythic;
	}

	override slot = GearSlot.Cloak;
	override baseStats = {
		[Stat.FarmingFortune]: 10,
		[Stat.FarmingWisdom]: 1,
		[Stat.Strength]: 10,
		[Stat.Ferocity]: 2,
	};
	override contestStatsMultiplier = 2;
	override upgrade = {
		id: 'LOTUS_CLOAK',
		reason: UpgradeReason.Situational,
		why: "A maxed Lotus Cloak provides slightly more fortune outside of a Jacob's contest, but significantly less fortune during one compared to a maxed Zorro's Cape.",
	};
}

export class PestVest extends BaseItem {
	get skyblockId() {
		return 'PEST_VEST';
	}
	get name() {
		return 'Pest Vest';
	}
	get wiki() {
		return 'https://wiki.hypixel.net/Pest_Vest';
	}
	get maxRarity() {
		return Rarity.Legendary;
	}

	override slot = GearSlot.Cloak;
	override baseStats = {
		[Stat.BonusPestChance]: 10,
		[Stat.PestCooldownReduction]: 15,
	};
}
