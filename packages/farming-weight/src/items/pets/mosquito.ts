import { FarmingPets, FarmingPetStatType } from '../../constants/pets.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { FarmingPetDefinition } from '../base-pet.js';
import type { FarmingPetAbility } from '../types/pets.js';

export class MosquitoPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.Mosquito;
	}

	get name() {
		return 'Mosquito';
	}

	get wiki() {
		return 'https://wiki.hypixel.net/Mosquito_Pet';
	}

	override perLevelStats = {
		[Stat.Speed]: {
			name: 'Speed',
			value: 0.2,
			type: FarmingPetStatType.Base,
		},
		[Stat.BonusPestChance]: {
			name: 'Bonus Pest Chance',
			value: 0.5,
			type: FarmingPetStatType.Base,
		},
	};

	override abilities: FarmingPetAbility[] = [
		{
			name: "Buzzin' Barterer",
			exists: (_, pet) => pet.rarity !== Rarity.Common && pet.rarity !== Rarity.Uncommon,
			computed: (player, pet) => {
				return {
					[Stat.SugarCaneFortune]: {
						name: "Buzzin' Barterer",
						value: Math.min(pet.level * 0.02 * (player.options.uniqueVisitors ?? 0), 175),
						type: FarmingPetStatType.Ability,
					},
				};
			},
		},
	];
}
