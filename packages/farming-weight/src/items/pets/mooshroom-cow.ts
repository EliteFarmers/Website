import { FarmingPetStatType, FarmingPets } from '../../constants/pets.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { FarmingPetDefinition } from '../base-pet.js';
import type { FarmingPetAbility } from '../types/pets.js';
import { petDropEffects } from './drop-effects.js';

export class MooshroomCowPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.MooshroomCow;
	}

	get name() {
		return 'Mooshroom Cow';
	}

	get wiki() {
		return 'https://w.elitesb.gg/Mooshroom_Cow_Pet';
	}

	override perLevelStats = {
		[Stat.FarmingFortune]: {
			name: 'Base Farming Fortune',
			value: 1,
			type: FarmingPetStatType.Base,
		},
	};

	override abilities: FarmingPetAbility[] = [
		{
			name: 'Farming Strength',
			exists: (_, pet) => pet.rarity === Rarity.Legendary,
			computed: (player, pet) => {
				const strengthPer = 40 - pet.level * 0.2;
				const strength = player.options.strength ?? 0;
				const amount = Math.floor((strength / strengthPer) * 0.7);
				return {
					[Stat.FarmingFortune]: {
						name: 'Farming Strength Fortune',
						value: amount,
						type: FarmingPetStatType.Ability,
					},
				};
			},
		},
		{
			name: 'Bovine Blessing',
			exists: (_, pet) => pet.rarity === Rarity.Legendary,
			computed: () => ({}),
			effects: (_, pet) => petDropEffects('Bovine Blessing', ['CHEESE_FUEL', 'DUNG'], 0.0002, pet),
		},
	];
}
