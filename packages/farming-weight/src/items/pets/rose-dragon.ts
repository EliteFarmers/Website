import { FarmingPets, FarmingPetStatType } from '../../constants/pets.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import type { FarmingPet } from '../../fortune/farmingpet.js';
import type { CalculateCropDetailedDropsOptions, DetailedDropsResult } from '../../util/ratecalc.js';
import { FarmingPetDefinition } from '../base-pet.js';
import type { FarmingPetAbility, FarmingPetInfo } from '../types/pets.js';

// This will be set by pets.ts after FARMING_PETS is created
let FARMING_PETS_REF: Record<FarmingPets, FarmingPetInfo> | null = null;

export function setFarmingPetsRef(ref: Record<FarmingPets, FarmingPetInfo>) {
	FARMING_PETS_REF = ref;
}

export class RoseDragonPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.RoseDragon;
	}

	get name() {
		return 'Rose Dragon';
	}

	get wiki() {
		return 'https://wiki.hypixel.net/Rose_Dragon_Pet';
	}

	override maxLevel = 200;

	override stats = {
		[Stat.FarmingFortune]: {
			name: 'Base Stats',
			type: FarmingPetStatType.Base,
			calculated: (pet: FarmingPet) => (pet.level < 101 ? 0 : pet.level * 0.2),
		},
		[Stat.Speed]: {
			name: 'Base Stats',
			type: FarmingPetStatType.Base,
			calculated: (pet: FarmingPet) => (pet.level < 101 ? 0 : pet.level * 0.5),
		},
	};

	override abilities: FarmingPetAbility[] = [
		{
			name: 'Garden Power',
			exists: (_, pet) => pet.level >= 101,
			computed: (player, pet) => {
				return {
					[Stat.FarmingFortune]: {
						name: 'Garden Power',
						value: (player.options.farmingLevel ?? 0) * ((3 * pet.level) / 200),
						type: FarmingPetStatType.Ability,
					},
				};
			},
		},
		{
			name: 'Rosy Scales',
			exists: (_, pet) => pet.level >= 101,
			computed: (player, pet) => {
				const milestoneLevels = Object.values(player.options.milestones ?? {}).reduce((a, b) => a + b, 0);
				return {
					[Stat.FarmingFortune]: {
						name: 'Rosy Scales',
						value: milestoneLevels * ((0.15 * pet.level) / 200),
						type: FarmingPetStatType.Ability,
					},
					[Stat.Speed]: {
						name: 'Rosy Scales',
						value: milestoneLevels * ((0.1 * pet.level) / 200),
						type: FarmingPetStatType.Ability,
					},
				};
			},
		},
		{
			name: "Dragon's Gluttony",
			exists: (_, pet) => pet.level >= 101,
			computed: () => ({}),
			ratesModifier: (current: DetailedDropsResult, _: CalculateCropDetailedDropsOptions, pet: FarmingPet) => {
				const chanceIncrease = pet.level * 0.002;
				if (chanceIncrease <= 0) return current;

				current.rareItemBonus += chanceIncrease;
				current.rareItemBonusBreakdown["Dragon's Gluttony"] = chanceIncrease;

				return current;
			},
		},
		{
			name: 'Symbiosis',
			exists: (_, pet) => pet.level >= 200,
			computed: ({ player }) => {
				const maxedPets: Record<string, number> = {};
				for (const pet of player?.pets ?? player?.options?.pets ?? []) {
					if (pet.type === FarmingPets.RoseDragon) {
						continue;
					}

					if ('level' in pet) {
						const info = FARMING_PETS_REF?.[pet.type as FarmingPets];
						if (pet.level >= 100 && (info?.maxRarity ?? Rarity.Legendary) === pet.rarity) {
							maxedPets[pet.type] = 1;
						}
					}
				}
				const maxedPetCount = Object.values(maxedPets).length;

				return {
					[Stat.FarmingFortune]: {
						name: 'Symbiosis',
						value: maxedPetCount * 3,
						type: FarmingPetStatType.Ability,
					},
				};
			},
		},
	];
}
