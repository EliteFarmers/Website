import { FarmingPets, FarmingPetStatType } from '../../constants/pets.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { FarmingPetDefinition } from '../base-pet.js';

export class BeePet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.Bee;
	}

	get name() {
		return 'Bee';
	}

	get wiki() {
		return 'https://wiki.hypixel.net/Bee_Pet';
	}

	override perLevelStats = {
		[Stat.Strength]: {
			name: 'Bee Strength',
			value: 0.3,
			type: FarmingPetStatType.Base,
		},
	};

	override perRarityLevelStats = {
		[Rarity.Rare]: {
			[Stat.FarmingFortune]: {
				name: 'Busy Buzz Buzz',
				value: 0.2,
				type: FarmingPetStatType.Base,
			},
		},
		[Rarity.Epic]: {
			[Stat.FarmingFortune]: {
				name: 'Busy Buzz Buzz',
				value: 0.3,
				type: FarmingPetStatType.Base,
			},
		},
		[Rarity.Legendary]: {
			[Stat.FarmingFortune]: {
				name: 'Busy Buzz Buzz',
				value: 0.3,
				type: FarmingPetStatType.Base,
			},
		},
	};
}
