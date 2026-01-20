import { FarmingPets, FarmingPetStatType } from '../../constants/pets.js';
import { Stat } from '../../constants/stats.js';
import { FarmingPetDefinition } from '../base-pet.js';

export class ChickenPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.Chicken;
	}

	get name() {
		return 'Chicken';
	}

	get wiki() {
		return 'https://wiki.hypixel.net/Chicken_Pet';
	}

	override perLevelStats = {
		[Stat.Speed]: {
			name: 'Speed',
			value: 0.5,
			type: FarmingPetStatType.Base,
		},
		[Stat.FarmingFortune]: {
			name: 'Farming Fortune',
			value: 0.5,
			type: FarmingPetStatType.Base,
		},
	};
}
