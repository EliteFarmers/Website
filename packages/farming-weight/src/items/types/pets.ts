import type { LateCalculationContext, LateCalculationResult } from '../../constants/latecalc.js';
import type { FarmingPetStatType } from '../../constants/pets.js';
import type { Rarity, RarityRecord } from '../../constants/reforges.js';
import type { Skill } from '../../constants/skills.js';
import type { StatsRecord } from '../../constants/stats.js';
import type { FarmingPet } from '../../fortune/farmingpet.js';
import type { FarmingPlayer } from '../../player/player.js';
import type { PlayerOptions } from '../../player/playeroptions.js';
import type { CalculateCropDetailedDropsOptions, DetailedDropsResult } from '../../util/ratecalc.js';

export interface FarmingPetType {
	uuid?: string | null;
	type?: string;
	exp?: number;
	active?: boolean;
	tier?: string | Rarity | null;
	heldItem?: string | null;
	candyUsed?: number;
	skin?: string | null;
}

export interface FarmingPetAbility {
	name: string;
	exists?: (player: { player?: FarmingPlayer; options: PlayerOptions }, pet: FarmingPet) => boolean;
	/** Computed stats during base phase calculation */
	computed: (player: { player?: FarmingPlayer; options: PlayerOptions }, pet: FarmingPet) => StatsRecord;
	/**
	 * Late-phase calculation that runs after all base stats are computed.
	 * Use this for abilities that depend on total fortune (e.g., Pig Pet's Trample).
	 */
	lateComputed?: (ctx: LateCalculationContext, pet: FarmingPet) => LateCalculationResult;
	ratesModifier?: (
		current: DetailedDropsResult,
		options: CalculateCropDetailedDropsOptions,
		pet: FarmingPet
	) => DetailedDropsResult;
	/** If true, this ability is considered a temporary fortune source and can be multiplied by Hypercharge chip */
	temporary?: boolean;
}

export interface FarmingPetInfo {
	name: string;
	wiki: string;
	maxLevel?: number;
	maxRarity?: Rarity;
	stats?: StatsRecord<FarmingPetStatType, FarmingPet>;
	perLevelStats?: StatsRecord<FarmingPetStatType, FarmingPet>;
	perRarityLevelStats?: RarityRecord<StatsRecord<FarmingPetStatType, FarmingPet>>;
	perStatStats?: StatsRecord<FarmingPetStatType>;
	abilities?: FarmingPetAbility[];
}

export interface FarmingPetItemInfo {
	name: string;
	wiki: string;
	stats?: StatsRecord<PlayerOptions>;
	skillReq?: Partial<Record<Skill, number>>;
}
