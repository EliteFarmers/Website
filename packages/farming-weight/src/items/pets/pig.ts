import { FarmingPets, FarmingPetStatType } from '../../constants/pets.js';
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
			computed: ({ player }) => {
				const fortune = (player?.fortune ?? 0) + (player?.tempFortune ?? 0);
				return {
					[Stat.FarmingFortune]: {
						name: 'Trample (75% Reduction)',
						value: -fortune * 0.75,
						type: FarmingPetStatType.Ability,
					},
				};
			},
		},
	];
}
