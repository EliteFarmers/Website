import { FarmingPets, FarmingPetStatType } from '../../constants/pets.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { FarmingPetDefinition } from '../base-pet.js';

export class RabbitPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.Rabbit;
	}

	get name() {
		return 'Rabbit';
	}

	get wiki() {
		return 'https://wiki.hypixel.net/Rabbit_Pet';
	}

	override maxRarity = Rarity.Mythic;

	override perLevelStats = {
		[Stat.Speed]: {
			name: 'Rabbit Speed',
			value: 0.2,
			type: FarmingPetStatType.Base,
		},
		[Stat.Health]: {
			name: 'Rabbit Health',
			value: 1,
			type: FarmingPetStatType.Base,
		},
	};

	override perRarityLevelStats = {
		[Rarity.Rare]: {
			[Stat.FarmingWisdom]: {
				name: 'Farming Wisdom Boost',
				value: 0.25,
				type: FarmingPetStatType.Ability,
			},
		},
		[Rarity.Epic]: {
			[Stat.FarmingWisdom]: {
				name: 'Farming Wisdom Boost',
				value: 0.3,
				type: FarmingPetStatType.Ability,
			},
		},
		[Rarity.Legendary]: {
			[Stat.FarmingWisdom]: {
				name: 'Farming Wisdom Boost',
				value: 0.3,
				type: FarmingPetStatType.Ability,
			},
		},
		[Rarity.Mythic]: {
			[Stat.FarmingWisdom]: {
				name: 'Farming Wisdom Boost',
				value: 0.3,
				type: FarmingPetStatType.Ability,
			},
		},
	};
}
