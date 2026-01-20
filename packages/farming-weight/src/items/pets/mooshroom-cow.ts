import { FarmingPets, FarmingPetStatType } from '../../constants/pets.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import type { FarmingPet } from '../../fortune/farmingpet.js';
import { FarmingPetDefinition } from '../base-pet.js';
import type { FarmingPetAbility } from '../types/pets.js';

export class MooshroomCowPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.MooshroomCow;
	}

	get name() {
		return 'Mooshroom Cow';
	}

	get wiki() {
		return 'https://wiki.hypixel.net/Mooshroom_Cow_Pet';
	}

	override stats = {
		[Stat.FarmingFortune]: {
			name: 'Base Farming Fortune',
			calculated: (pet: FarmingPet) => 10 + pet.level,
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
	];
}
