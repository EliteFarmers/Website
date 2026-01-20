import { FarmingPetStatType, FarmingPets } from '../constants/pets.js';
import { Rarity, type RarityRecord } from '../constants/reforges.js';
import { type StatsRecord } from '../constants/stats.js';
import type { FarmingPet } from '../fortune/farmingpet.js';
import { type FarmingPetAbility, type FarmingPetInfo } from './types/pets.js';

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

    constructor() {}
}
