import { Rarity } from '../../constants/reforges.js';
import { BaseAccessory } from './base.js';

export class PowerRelic extends BaseAccessory {
	get skyblockId() {
		return 'POWER_RELIC';
	}
	get name() {
		return 'Relic of Power';
	}
	get wiki() {
		return 'https://w.elitesb.gg/Relic_of_Power';
	}
	get maxRarity() {
		return Rarity.Mythic;
	}

	override gemSlots = [
		{ slot_type: 'JADE', costs: [] },
		{ slot_type: 'AMBER', costs: [] },
		{ slot_type: 'TOPAZ', costs: [] },
		{ slot_type: 'SAPPHIRE', costs: [] },
		{ slot_type: 'AMETHYST', costs: [] },
		{ slot_type: 'JASPER', costs: [] },
		{ slot_type: 'RUBY', costs: [] },
		{ slot_type: 'OPAL', costs: [] },
		{ slot_type: 'ONYX', costs: [] },
		{ slot_type: 'PERIDOT', costs: [] },
		{ slot_type: 'CITRINE', costs: [] },
		{ slot_type: 'AQUAMARINE', costs: [] },
	];
	override cost = {
		items: {
			PERFECT_PLATE: 1,
			GLACITE_AMALGAMATION: 32,
		},
	};
}
