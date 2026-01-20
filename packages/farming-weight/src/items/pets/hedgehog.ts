import { FarmingPets, FarmingPetStatType } from '../../constants/pets.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { unlockedPestBestiaryTiers } from '../../util/pests.js';
import { FarmingPetDefinition } from '../base-pet.js';
import type { FarmingPetAbility } from '../types/pets.js';

export class HedgehogPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.Hedgehog;
	}

	get name() {
		return 'Hedgehog';
	}

	get wiki() {
		return 'https://wiki.hypixel.net/Hedgehog_Pet';
	}

	override perLevelStats = {
		[Stat.Speed]: {
			name: 'Speed',
			value: 0.15,
			type: FarmingPetStatType.Base,
		},
	};

	override perRarityLevelStats = {
		[Rarity.Legendary]: {
			[Stat.PestKillFortune]: {
				name: 'Fearsome Farmer',
				value: 1,
				type: FarmingPetStatType.Ability,
			},
		},
	};

	override abilities: FarmingPetAbility[] = [
		{
			name: "Hunter's Insight",
			exists: (_, pet) => pet.rarity === Rarity.Legendary,
			computed: (player) => {
				return {
					[Stat.FarmingFortune]: {
						name: "Hunter's Insight",
						value: unlockedPestBestiaryTiers(player.options.bestiaryKills ?? {}) * 0.7,
						type: FarmingPetStatType.Ability,
					},
				};
			},
		},
	];
}
