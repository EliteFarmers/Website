import type { Crop } from '../constants/crops.js';
import type { Rarity, RarityRecord, ReforgeTarget } from '../constants/reforges.js';
import type { Skill } from '../constants/skills.js';
import type { SpecialCrop } from '../constants/specialcrops.js';
import type { Stat, StatsRecord } from '../constants/stats.js';
import type { Upgrade, UpgradeCost } from '../constants/upgrades.js';
import type { GemSlotCost, GemSlotRequirement } from '../fortune/upgradeable.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import type { FarmingToolType, GearSlot, ItemDefinition } from './definitions.js';

export abstract class BaseItem implements ItemDefinition {
	abstract get skyblockId(): string;
	abstract get name(): string;
	abstract get wiki(): string;
	abstract get maxRarity(): Rarity;

	upgrade?: Upgrade;
	gemSlots?: { slot_type: string; costs: GemSlotCost[]; requirements?: GemSlotRequirement[] }[];
	stats?: RarityRecord<StatsRecord>;
	baseStats?: Partial<Record<Stat, number>>;
	cost?: UpgradeCost;
	computedStats?: (opt: PlayerOptions) => Partial<Record<Stat, number>>;
	skillReq?: Partial<Record<string, number>>;
	type?: FarmingToolType | ReforgeTarget;
	crop?: Crop;
	crops?: Crop[];
	slot?: GearSlot;
	special?: SpecialCrop[];
	family?: string;
	familyOrder?: number;
	contestStatsMultiplier?: number;
	perLevelStats?: { skill: Skill; appliesTo?: ReforgeTarget[]; stats: Partial<Record<Stat, number>> };
}
