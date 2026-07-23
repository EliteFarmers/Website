import { FarmingPetStatType, FarmingPets } from '../../constants/pets.js';
import { compareRarity, Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { FarmingPetDefinition } from '../base-pet.js';
import type { FarmingPetAbility } from '../types/pets.js';
import { petDropEffects } from './drop-effects.js';

export class OrchidMantisPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.OrchidMantis;
	}

	get name() {
		return 'Orchid Mantis';
	}

	get wiki() {
		return 'https://w.elitesb.gg/Orchid_Mantis_Pet';
	}

	override maxRarity = Rarity.Legendary;

	override perLevelStats = {
		[Stat.Speed]: {
			name: 'Base Speed',
			value: 0.3,
			type: FarmingPetStatType.Base,
		},
		[Stat.Overbloom]: {
			name: 'Base Overbloom',
			value: 0.15,
			type: FarmingPetStatType.Base,
		},
	};

	override toolExperienceMultiplier = (pet: { level: number }) => 1 + (0.2 * pet.level) / 100;

	override abilities: FarmingPetAbility[] = [
		{
			name: 'Swift Sickles',
			exists: (_, pet) => compareRarity(pet.rarity, Rarity.Rare) >= 0,
			computed: ({ options }, pet) => {
				const eligibleSpeed = Math.max(0, (options.speed ?? 0) - 100);
				const rarityMultiplier = compareRarity(pet.rarity, Rarity.Epic) >= 0 ? 1 : 0.5;
				return {
					[Stat.FarmingFortune]: {
						name: 'Swift Sickles',
						value: (eligibleSpeed / 3) * (pet.level / 100) * rarityMultiplier,
						type: FarmingPetStatType.Ability,
					},
				};
			},
		},
		{
			name: 'Orchid Nectar',
			exists: (_, pet) => compareRarity(pet.rarity, Rarity.Legendary) >= 0,
			computed: () => ({}),
			effects: (_, pet) => petDropEffects('Orchid Nectar', ['JELLY', 'PLANT_MATTER'], 0.0002, pet),
		},
	];
}
