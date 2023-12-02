import { Crop } from '../constants/crops';
import { FortuneFromPersonalBestContest } from '../constants/personalbests';
import { FortuneFromPestBestiary } from '../constants/pests';
import { FarmingPetType } from '../constants/pets';
import { FORTUNE_PER_CROP_UPGRADE, FORTUNE_PER_PLOT } from '../constants/specific';
import { ItemIdFromCrop } from '../util/names';
import { Item } from './item';

export interface FortuneMissingFromAPI {
	cropUpgrades?: Record<Crop, number>;
	gardenLevel?: number;
	plotsUnlocked?: number;
	uniqueVisitors?: number;
	milestones?: Partial<Record<Crop, number>>;
}

export interface PlayerOptions extends FortuneMissingFromAPI {
	collection?: Record<string, number>;
	farmingXp?: number;
	farmingLevel?: number;
	strength?: number;

	tools: Item[];
	armor: Item[];
	equipment: Item[];
	pets: FarmingPetType[];

	personalBests?: Record<string, number>;
	bestiaryKills?: Record<string, number>;
}

export function CreatePlayer(options: PlayerOptions) {
	return new Player(options);
}

class Player {
	declare options: PlayerOptions;

	constructor(options: PlayerOptions) {
		this.options = options;
	}

	getCropFortune(crop: Crop) {
		let sum = 0;
		const breakdown = {} as Record<string, number>;

		// Crop upgrades
		const upgrade = FORTUNE_PER_CROP_UPGRADE * (this.options.cropUpgrades?.[crop] ?? 0);
		if (upgrade > 0) {
			breakdown['Crop Upgrade'] = upgrade;
			sum += upgrade;
		}

		// Plots
		const plots = FORTUNE_PER_PLOT * (this.options.plotsUnlocked ?? 0);
		if (plots > 0) {
			breakdown['Unlocked Plots'] = plots;
			sum += plots;
		}

		// Personal bests
		const personalBest = this.options.personalBests?.[ItemIdFromCrop(crop)];
		if (personalBest) {
			const fortune = FortuneFromPersonalBestContest(crop, personalBest);
			if (fortune > 0) {
				breakdown['Personal Best'] = fortune;
				sum += fortune;
			}
		}

		// Bestiary
		if (this.options.bestiaryKills) {
			const bestiary = FortuneFromPestBestiary(this.options.bestiaryKills);
			if (bestiary > 0) {
				breakdown['Pest Bestiary'] = bestiary;
				sum += bestiary;
			}
		}

		return sum;
	}
}

export interface JacobFarmingContest {
	crop: Crop;
	timestamp: number;
	collected: number;
	position?: number;
	participants?: number;
	medal?: number;
}
