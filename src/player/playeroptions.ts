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
	cocoaFortuneUpgrade?: number;
	axed?: boolean;

	sprayedPlot?: boolean;
	infestedPlotProbability?: number;

	attributes?: Record<string, number>;

	temporaryFortune?: TemporaryFarmingFortune;
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

	personalBests?: Record<string, number>;
	bestiaryKills?: Record<string, number>;
	anitaBonus?: number;
	uniqueVisitors?: number;

	extraFortune?: ExtraFarmingFortune[];
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
