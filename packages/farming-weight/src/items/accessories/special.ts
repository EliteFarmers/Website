import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import type { PlayerOptions } from '../../player/playeroptions.js';
import { BaseAccessory } from './base.js';

export class Magic8BallAccessory extends BaseAccessory {
	get skyblockId() {
		return 'MAGIC_8_BALL';
	}
	get name() {
		return 'Magic 8 Ball';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Magic_8_Ball';
	}
	get maxRarity() {
		return Rarity.Epic;
	}

	override baseStats = {
		[Stat.FarmingFortune]: 0,
	};

	override computedStats = (_opt: PlayerOptions) => ({
		[Stat.FarmingFortune]: 25 * 0.2,
	});
}

export class AtmosphericFilterAccessory extends BaseAccessory {
	get skyblockId() {
		return 'ATMOSPHERIC_FILTER';
	}
	get name() {
		return 'Atmospheric Filter';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Atmospheric_Filter';
	}
	get maxRarity() {
		return Rarity.Rare;
	}

	override baseStats = {
		[Stat.FarmingFortune]: 0,
	};
}
