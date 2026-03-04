import type { FarmingPetStatType, FarmingPets } from '../constants/pets.js';
import type { Rarity, RarityRecord } from '../constants/reforges.js';
import type { StatsRecord } from '../constants/stats.js';
import type { FarmingPet } from '../fortune/farmingpet.js';
import type { FarmingPetAbility, FarmingPetInfo } from './types/pets.js';

export abstract class FarmingPetDefinition implements FarmingPetInfo {
	abstract get id(): FarmingPets;
	abstract get name(): string;
	abstract get wiki(): string;

	maxLevel?: number;
	maxRarity?: Rarity;

	stats?: StatsRecord<FarmingPetStatType, FarmingPet>;
	perLevelStats?: StatsRecord<FarmingPetStatType, FarmingPet>;
	perRarityLevelStats?: RarityRecord<StatsRecord<FarmingPetStatType, FarmingPet>>;
	perStatStats?: StatsRecord<FarmingPetStatType>;
	abilities?: FarmingPetAbility[];
}
