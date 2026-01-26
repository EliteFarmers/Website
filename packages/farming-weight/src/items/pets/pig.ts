import { FarmingPetStatType, FarmingPets } from '../../constants/pets.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { FarmingPetDefinition } from '../base-pet.js';
import type { FarmingPetAbility } from '../types/pets.js';

export class PigPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.Pig;
	}

	get name() {
		return 'Pig';
	}

	get wiki() {
		return 'https://wiki.hypixel.net/Pig_Pet';
	}

	override perLevelStats = {
		[Stat.Speed]: {
			name: 'Speed',
			value: 0.25,
			type: FarmingPetStatType.Base,
		},
	};

	override abilities: FarmingPetAbility[] = [
		{
			name: 'Trample',
			exists: (_, pet) => pet.rarity === Rarity.Legendary,
			computed: () => ({}), // No base stats, uses lateComputed
			lateComputed: (ctx) => {
				// Apply 0.25x multiplier (75% reduction) to total fortune
				const reduction = -ctx.baseFortune * 0.75;
				return {
					multiplier: 0.25,
					breakdown: {
						'Trample (75% Reduction)': {
							value: reduction,
							stat: Stat.FarmingFortune,
							factor: 0.25,
						},
					},
				};
			},
		},
	];
}
