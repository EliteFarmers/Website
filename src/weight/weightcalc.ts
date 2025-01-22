import { Crop } from '../constants/crops.js';
import { BONUS_WEIGHT, CROP_WEIGHT, TIER_12_MINIONS } from '../constants/weight.js';
import { calculateJacobContestMedal } from '../util/jacob.js';
import { uncountedCropsFromPests } from '../util/pests.js';

export function createFarmingWeightCalculator(info?: FarmingWeightInfo) {
	return new FarmingWeight(info);
}

const crops = [
	Crop.Cactus,
	Crop.Carrot,
	Crop.CocoaBeans,
	Crop.Melon,
	Crop.Mushroom,
	Crop.NetherWart,
	Crop.Potato,
	Crop.Pumpkin,
	Crop.SugarCane,
	Crop.Wheat,
];

export interface FarmingWeightInfo {
	collection?: Record<string, number>;
	farmingXp?: number;
	levelCapUpgrade?: number;
	anitaBonusFarmingFortuneLevel?: number;
	minions?: string[];
	contests?: {
		collected: number;
		claimed_position?: number;
		claimed_participants?: number;
		claimed_medal?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | string;
	}[];
	pests?: Record<string, number>;
}

class FarmingWeight {
	declare collection: Record<Crop, number>;
	declare levelCapUpgrade: number;
	declare farmingXp: number;
	declare anitaBonusFarmingFortuneLevel: number;
	declare tier12MinionCount: number;
	declare earnedMedals: Record<'diamond' | 'platinum' | 'gold', number>;
	declare cropWeights: Record<Crop, number>;
	declare bonusSources: Record<string, number>;
	declare uncountedCrops: Partial<Record<Crop, number>>;

	readonly info?: FarmingWeightInfo;

	constructor(info?: FarmingWeightInfo) {
		this.info = info;

		this.collection = {} as Record<Crop, number>;
		this.levelCapUpgrade = info?.levelCapUpgrade ?? 0;
		this.anitaBonusFarmingFortuneLevel = info?.anitaBonusFarmingFortuneLevel ?? 0;
		this.farmingXp = info?.farmingXp ?? 0;
		this.earnedMedals = { diamond: 0, platinum: 0, gold: 0 };
		this.tier12MinionCount = 0;
		this.bonusSources = {} as Record<string, number>;
		this.uncountedCrops = {} as Record<Crop, number>;

		this.setContests(info?.contests ?? []);
		this.calcUncountedCrops(info?.pests ?? {});
		this.setCropsFromCollections(info?.collection ?? {});
		this.addMinions(info?.minions ?? []);
	}

	/**
	 * Expectes a dictionary of collections and amounts with the default Hypixel SkyBlock IDs
	 * @param {Record<string, number>} collections
	 * @returns {FarmingWeight}
	 */
	setCropsFromCollections(collections: Record<string, number>): FarmingWeight {
		for (const crop of crops) {
			this.collection[crop] = collections[crop] ?? 0;
		}
		this.getCropWeights();
		return this;
	}

	setCrop = (crop: Crop, collection: number) => {
		this.collection[crop] = collection;
		this.getCropWeights();
		return this;
	};

	setLevelCap = (levelCap: number) => {
		this.levelCapUpgrade = levelCap;
		return this;
	};

	setFarmingXp = (farmingXp: number) => {
		this.farmingXp = farmingXp;
		return this;
	};

	setAnitaBonusLevel = (anitaBonusFarmingFortuneLevel: number) => {
		this.anitaBonusFarmingFortuneLevel = anitaBonusFarmingFortuneLevel;
		return this;
	};

	addMinions = (minions: string[]) => {
		for (const minion of minions) {
			if (!minion.endsWith('_12')) continue;
			if (!TIER_12_MINIONS.includes(minion)) continue;

			this.tier12MinionCount++;
		}
		return this;
	};

	setEarnedMedals = ({ diamond, platinum, gold }: { diamond?: number; platinum?: number; gold?: number }) => {
		this.earnedMedals = {
			diamond: diamond ?? this.earnedMedals.diamond,
			platinum: platinum ?? this.earnedMedals.platinum,
			gold: gold ?? this.earnedMedals.gold,
		};

		return this;
	};

	setTier12MinionCount = (count: number) => {
		this.tier12MinionCount = count;
		return this;
	};

	setContests = (contests: FarmingWeightInfo['contests']) => {
		if (!contests?.length) return this;

		for (const contest of contests) {
			const medal = calculateJacobContestMedal(contest);
			if (!medal) continue;

			if (medal === 'diamond') {
				this.earnedMedals.diamond++;
			} else if (medal === 'platinum') {
				this.earnedMedals.platinum++;
			} else if (medal === 'gold') {
				this.earnedMedals.gold++;
			}
		}

		this.getBonusWeights();
		return this;
	};

	getWeightInfo = () => {
		const bonus = this.getBonusWeights();
		const crops = this.getCropWeights();

		const bonusTotal = Object.values(bonus).reduce((a, b) => a + b, 0);
		const cropTotal = Object.values(crops).reduce((a, b) => a + b, 0);

		return {
			totalWeight: bonusTotal + cropTotal,
			bonusWeight: bonusTotal,
			cropWeight: cropTotal,
			bonusSources: bonus,
			uncountedCrops: this.uncountedCrops,
		};
	};

	getBonusWeights = () => {
		this.bonusSources = {} as Record<string, number>;

		if (this.farmingXp >= 111_672_425 && this.levelCapUpgrade >= 10) {
			// Farming 60 bonus
			this.bonusSources['Farming 60'] = BONUS_WEIGHT.Farming60Bonus;
		} else if (this.farmingXp >= 55_172_425) {
			// Farming 50 bonus
			this.bonusSources['Farming 50'] = BONUS_WEIGHT.Farming50Bonus;
		}

		// Tier 12 minion bonus
		if (this.tier12MinionCount > 0) {
			this.bonusSources['Tier 12 Minions'] = this.tier12MinionCount * BONUS_WEIGHT.MinionRewardWeight;
		}

		// Anita bonus
		if (this.anitaBonusFarmingFortuneLevel > 0) {
			this.bonusSources['Anita Bonus'] =
				this.anitaBonusFarmingFortuneLevel * BONUS_WEIGHT.AnitaBuffBonusMultiplier;
		}

		const maxMedals = BONUS_WEIGHT.MaxMedalsCounted;
		if (this.earnedMedals.diamond >= maxMedals) {
			this.bonusSources['Contest Medals'] = BONUS_WEIGHT.WeightPerDiamondMedal * BONUS_WEIGHT.MaxMedalsCounted;
		} else {
			const diamond = this.earnedMedals.diamond;
			const platinum = Math.min(maxMedals - diamond, this.earnedMedals.platinum);
			const gold = Math.min(maxMedals - diamond - platinum, this.earnedMedals.gold);

			const medals =
				diamond * BONUS_WEIGHT.WeightPerDiamondMedal +
				platinum * BONUS_WEIGHT.WeightPerPlatinumMedal +
				gold * BONUS_WEIGHT.WeightPerGoldMedal;

			this.bonusSources['Contest Medals'] = medals;
		}

		return this.bonusSources;
	};

	getCropWeights = () => {
		const cropWeight = {} as Record<Crop, number>;
		let totalWeight = 0;
		let doubleBreakWeight = 0;

		for (const crop of crops) {
			let collected = this.collection[crop] ?? 0;

			// Subtract uncounted crops
			if (this.uncountedCrops[crop]) {
				collected = Math.max(0, collected - (this.uncountedCrops[crop] ?? 0));
			}

			const weight = collected / CROP_WEIGHT[crop];

			totalWeight += weight;

			if (crop === Crop.Cactus || crop === Crop.SugarCane) {
				doubleBreakWeight += weight;
			}

			cropWeight[crop] = weight;
		}

		// Mushroom is a special case, it needs to be calculated dynamically based on the
		// ratio between the farmed crops that give two mushrooms per break with cow pet
		// and the farmed crops that give one mushroom per break with cow pet
		const mushroomCollection = this.collection[Crop.Mushroom] ?? 0;
		const mushroomWeightNumber = CROP_WEIGHT[Crop.Mushroom];

		const doubleBreakRatio = doubleBreakWeight / totalWeight;
		const normalCropRatio = (totalWeight - doubleBreakWeight) / totalWeight;

		const mushroomWeight =
			doubleBreakRatio * (mushroomCollection / (mushroomWeightNumber * 2)) +
			normalCropRatio * (mushroomCollection / mushroomWeightNumber);

		cropWeight[Crop.Mushroom] = mushroomWeight;

		return cropWeight;
	};

	calcUncountedCrops = (bestiary: Record<string, number>) => {
		this.uncountedCrops = uncountedCropsFromPests(bestiary);
		this.getCropWeights();
		return this;
	};

	getCropWeight = (crop: Crop) => {
		CROP_WEIGHT[crop];
	};
}


/**
 * Get the weight of a single crop based on the collection amount.
 * Use `createFarmingWeightCalculator` to calculate accurate weight of multiple crops
 * @param {Crop} crop
 * @param {number} collection
 * @returns {number}
 */
export function calcWeightForCrop(crop: Crop, collection: number): number {
	return collection / CROP_WEIGHT[crop];
}