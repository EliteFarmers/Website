import { FarmingPetStatType, FarmingPets } from '../../constants/pets.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { FarmingPetDefinition } from '../base-pet.js';
import type { FarmingPetAbility } from '../pets.js';

export class BeePet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.Bee;
	}

	get name() {
		return 'Bee';
	}

	get wiki() {
		return 'https://w.elitesb.gg/Bee_Pet';
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
        [Rarity.Mythic]: {
            [Stat.FarmingFortune]: {
                name: 'Busy Buzz Buzz',
                value: 0.4,
                type: FarmingPetStatType.Base,
            },
        },
	};

    override abilities = [
        {
            name: 'Powered by Pollen',
            exists: (_, pet) => pet.rarity === Rarity.Mythic,
            computed: (_, pet) => {
                return {
                    [Stat.MoonflowerFortune]: {
                        name: 'Powered by Pollen',
                        value: 1.6 * pet.level,
                        type: FarmingPetStatType.Ability,
                    },
                    [Stat.SunflowerFortune]: {
                        name: 'Powered by Pollen',
                        value: 1.6 * pet.level,
                        type: FarmingPetStatType.Ability,
                    },
                    [Stat.WildRoseFortune]: {
                        name: 'Powered by Pollen',
                        value: 1.6 * pet.level,
                        type: FarmingPetStatType.Ability,
                    },
                }
            }
        }
    ] as FarmingPetAbility[];
}
