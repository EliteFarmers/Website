import { FarmingPetStatType, FarmingPets } from '../../constants/pets.js';
import { Rarity } from '../../constants/reforges.js';
import { Stat } from '../../constants/stats.js';
import { getBestiaryLevel } from '../../util/bestiary.js';
import { FarmingPetDefinition } from '../base-pet.js';
import type { FarmingPetAbility } from '../types/pets.js';

export class PigPet extends FarmingPetDefinition {
	get id() {
		return FarmingPets.Pig;
	}

	get name() {
		return 'Pig';
	}

	get wiki() {
		return 'https://w.elitesb.gg/Pig_Pet';
	}

	override perLevelStats = {
		[Stat.Speed]: {
			name: 'Speed',
			value: 0.25,
			type: FarmingPetStatType.Base,
		},
        [Stat.PotatoFortune]: {
            name: 'Potato Fortune',
            value: 0.2,
            type: FarmingPetStatType.Base,
        },
	};

	override abilities: FarmingPetAbility[] = [
        {
			name: 'Shining Stampede',
			exists: (_, pet) => pet.rarity === Rarity.Rare || pet.rarity === Rarity.Epic || pet.rarity === Rarity.Legendary,
			computed: (ctx, pet) => {
                const shinyPigKills = ctx.options.bestiaryKills?.['shiny_pig_1'] ?? 0;
                if (shinyPigKills === 0) {
                    return {};
                }

                const bestiaryLevel = getBestiaryLevel(shinyPigKills, 5, 15);

                return {
                    [Stat.PotatoFortune]: {
                        name: 'Shining Stampede',
                        value: (pet.rarity === Rarity.Rare ? 0.04 : 0.05) * pet.level * bestiaryLevel,
                        type: FarmingPetStatType.Ability,
                    },
                };
            },
		}
	];
}
