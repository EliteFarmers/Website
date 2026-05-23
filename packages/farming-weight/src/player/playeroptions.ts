import type { Crop } from '../constants/crops.js';
import type { TemporaryFarmingFortune } from '../constants/tempfortune.js';
import type { Upgrade } from '../constants/upgrades.js';
import type { FarmingAccessory } from '../fortune/farmingaccessory.js';
import type { ArmorSet, FarmingArmor } from '../fortune/farmingarmor.js';
import type { FarmingEquipment } from '../fortune/farmingequipment.js';
import type { FarmingPet } from '../fortune/farmingpet.js';
import type { FarmingTool } from '../fortune/farmingtool.js';
import type { EliteItemDto } from '../fortune/item.js';
import type { FarmingPetType } from '../items/pets.js';

export interface FarmingPlayerGardenChips {
	cropshot?: number | null;
	sowledge?: number | null;
	hypercharge?: number | null;
	quickdraw?: number | null;
	mechamind?: number | null;
	overdrive?: number | null;
	synthesis?: number | null;
	verminVaporizer?: number | null;
	vermin_vaporizer?: number | null;
	evergreen?: number | null;
	rarefinder?: number | null;
}

export interface FortuneMissingFromAPI {
	cropUpgrades?: Partial<Record<Crop, number>>;
	gardenLevel?: number;
	plotsUnlocked?: number;
	plots?: string[];
	uniqueVisitors?: number;
	communityCenter?: number;
	milestones?: Partial<Record<Crop, number>>;
	exportableCrops?: Partial<Record<Crop, boolean>>;
	refinedTruffles?: number;
	wrigglingLarva?: number;
	cocoaFortuneUpgrade?: number;
	filledRosewaterFlask?: number;

	sprayedPlot?: boolean;
	pesthunterAccessoryEnabled?: boolean;
	mantidPestKills?: number;
	infestedPlotProbability?: number;

	attributes?: Record<string, number>;
	chips?: Partial<FarmingPlayerGardenChips>;
	/**
	 * Raw SkyBlock profile perk levels. Carnival Harvest Feast perks use keys like
	 * `natural_talent` and `fortunate_feasting`.
	 */
	perks?: CarnivalHarvestFeastPerks & Record<string, string | null | number | undefined>;

	/**
	 * Harvest Feast event state. When `active`, in-season RARE CROP drops (Seasoning + per-crop materials)
	 * are included in detailed drop calculations and Carnival Harvest Feast perks contribute fortune.
	 */
	harvestFeast?: HarvestFeastOptions;

	temporaryFortune?: TemporaryFarmingFortune;
}

export interface HarvestFeastOptions {
	/** Whether a Harvest Feast (or Mayor Finnegan's Grand Feast) is currently active. */
	active: boolean;
	/** The crops that are in-season this month. Caller is responsible for computing this from the SkyBlock date. */
	inSeasonCrops?: Crop[];
	/** Whether the active feast is a Grand Feast (extends to entire SkyBlock year via Mayor Finnegan). */
	grandFeast?: boolean;
	/** Explicit Carnival Harvest Feast perk progress, if the raw profile `perks` bag is unavailable. */
	perks?: CarnivalHarvestFeastPerks;
}

export interface CarnivalHarvestFeastPerks {
	[key: string]: string | null | number | undefined;
	natural_talent?: string | null | number;
	fortunate_feasting?: string | null | number;
	feast_crashers?: string | null | number;
}

export interface ExtraFarmingFortune {
	crop?: Crop;
	name?: string;
	fortune: number;
}

export enum ZorroMode {
	Normal = 'normal',
	Averaged = 'averaged',
	Contest = 'contest',
}

export interface PlayerOptions extends FortuneMissingFromAPI {
	collection?: Record<string, number>;
	farmingXp?: number;
	farmingLevel?: number;
	strength?: number;

	tools?: EliteItemDto[] | FarmingTool[];
	armor?: EliteItemDto[] | FarmingArmor[] | ArmorSet;
	equipment?: EliteItemDto[] | FarmingEquipment[];
	accessories?: EliteItemDto[] | FarmingAccessory[];
	pets?: FarmingPetType[] | FarmingPet[];

	selectedTool?: FarmingTool;
	selectedPet?: FarmingPet;
	selectedCrop?: Crop;

	personalBestsUnlocked?: boolean;
	personalBests?: Record<string, number>;
	bestiaryKills?: Record<string, number>;
	anitaBonus?: number;
	uniqueVisitors?: number;
	dnaMilestone?: number;

	extraFortune?: ExtraFarmingFortune[];
	/**
	 * Jacob's Contest context for contest-dependent bonuses.
	 * `crop` is the currently active contest crop.
	 */
	jacobContest?: {
		enabled: boolean;
		crop?: Crop;
	};
	zorro?: {
		enabled: boolean;
		mode: ZorroMode | `${ZorroMode}`;
	};
}

export interface FortuneProgress {
	total: number;
	progress: number;
	upgrades: Upgrade[];
}
