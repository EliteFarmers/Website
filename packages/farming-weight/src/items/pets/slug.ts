import { FarmingPetStatType, FarmingPets } from '../../constants/pets.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { FarmingPetDefinition } from '../base-pet.js';
import type { FarmingPetAbility } from '../types/pets.js';

export class SlugPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.Slug;
	}

	get name() {
		return 'Slug';
	}

	get wiki() {
		return 'https://wiki.hypixel.net/Slug_Pet';
	}

	override perLevelStats = {
		[Stat.Defense]: {
			name: 'Slug Defense',
			value: 0.2,
			type: FarmingPetStatType.Base,
		},
		[Stat.Intelligence]: {
			name: 'Slug Intelligence',
			value: 0.25,
			type: FarmingPetStatType.Base,
		},
	};

	override perRarityLevelStats = {
		[Rarity.Epic]: {
			[Stat.BonusPestChance]: {
				name: 'Pest Friends',
				value: 0.4,
				type: FarmingPetStatType.Ability,
			},
		},
		[Rarity.Legendary]: {
			[Stat.BonusPestChance]: {
				name: 'Pest Friends',
				value: 0.4,
				type: FarmingPetStatType.Ability,
			},
		},
	};

	override abilities: FarmingPetAbility[] = [
		{
			name: 'Repugnant Aroma',
			exists: (player, pet) => pet.rarity === Rarity.Legendary && (player.options.sprayedPlot ?? false),
			temporary: true,
			computed: (_, pet) => {
				return {
					[Stat.FarmingFortune]: {
						name: 'Repugnant Aroma',
						value: pet.level,
						type: FarmingPetStatType.Ability,
					},
				};
			},
		},
	];
}
