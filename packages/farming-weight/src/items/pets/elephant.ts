import { FarmingPetStatType, FarmingPets } from '../../constants/pets.js';
import { Stat } from '../../constants/stats.js';
import { FarmingPetDefinition } from '../base-pet.js';

export class ElephantPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.Elephant;
	}

	get name() {
		return 'Elephant';
	}

	get wiki() {
		return 'https://wiki.hypixel.net/Elephant_Pet';
	}

	override perLevelStats = {
		[Stat.FarmingFortune]: {
			name: 'Farming Fortune',
			value: 1.5,
			type: FarmingPetStatType.Ability,
		},
	};
}
