import { FarmingPetStatType, FarmingPets } from '../../constants/pets.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { FarmingPetDefinition } from '../base-pet.js';
import type { FarmingPetAbility } from '../types/pets.js';

export class ElephantPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.Elephant;
	}

	get name() {
		return 'Elephant';
	}

	get wiki() {
		return 'https://w.elitesb.gg/Elephant_Pet';
	}

	override perLevelStats = {
		[Stat.FarmingFortune]: {
			name: 'Farming Fortune',
			value: 1.5,
			type: FarmingPetStatType.Ability,
		},
	};

	override perRarityLevelStats = {
		[Rarity.Mythic]: {
			[Stat.FarmingFortune]: {
				name: 'Mythic Base Farming Fortune',
				value: 0.5,
				type: FarmingPetStatType.Base,
			},
		},
	};

	override abilities: FarmingPetAbility[] = [
		{
			name: 'Abundant Harvest',
			exists: (_, pet) => pet.rarity === Rarity.Mythic,
			computed: () => ({}),
			effects: () => [
				{
					source: 'Abundant Harvest',
					op: 'mul-drop',
					value: 1.2,
					scope: { tags: ['sowdust'] },
				},
			],
		},
	];
}
