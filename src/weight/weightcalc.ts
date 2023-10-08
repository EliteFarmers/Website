import { Crop } from '../constants/crops';
import { BONUS_WEIGHT, CROP_WEIGHT, TIER_12_MINIONS } from '../constants/weight';

export function CreateFarmingWeightCalculator(info?: FarmingWeightInfo) {
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

interface FarmingWeightInfo {
	collection?: Record<string, number>;
	farmingXp?: number;
	levelCapUpgrade?: number;
	anitaBonusFarmingFortuneLevel?: number;
	minions?: string[];
	contests?: {
		collected: number;
		claimed_position?: number;
		claimed_participants?: number;
		claimed_medal?: 'bronze' | 'silver' | 'gold';
	}[];
}

class FarmingWeight {
	declare collection: Record<Crop, number>;
	declare levelCapUpgrade: number;
	declare farmingXp: number;
	declare anitaBonusFarmingFortuneLevel: number;
	declare tier12MinionCount: number;
	declare earnedGoldMedals: number;
	declare cropWeights: Record<Crop, number>;
	declare bonusSources: Record<string, number>;

	constructor(info?: FarmingWeightInfo) {
		this.collection = {} as Record<Crop, number>;
		this.levelCapUpgrade = info?.levelCapUpgrade ?? 0;
		this.anitaBonusFarmingFortuneLevel = info?.anitaBonusFarmingFortuneLevel ?? 0;
		this.farmingXp = info?.farmingXp ?? 0;
		this.earnedGoldMedals = 0;
		this.tier12MinionCount = 0;

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

	setTier12MinionCount = (count: number) => {
		this.tier12MinionCount = count;
		return this;
	};

	setContests = (contests: FarmingWeightInfo['contests']) => {
		if (!contests?.length) return this;

		for (const contest of contests) {
			if (contest.claimed_medal === 'gold') {
				this.earnedGoldMedals++;
				continue;
			}

			const position = contest.claimed_position;
			const participants = contest.claimed_participants;

			if (position === undefined || participants === undefined) continue;

			if (position <= participants * 0.05 + 1) {
				this.earnedGoldMedals++;
			}
		}

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
		};
	}

	getBonusWeights = () => {
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

		if (this.earnedGoldMedals > BONUS_WEIGHT.MaxMedalsCounted) {
			this.bonusSources['Gold Medals'] = Math.floor(
				BONUS_WEIGHT.WeightPerGoldMedal * BONUS_WEIGHT.MaxMedalsCounted
			);
		} else {
			const rewardCount = Math.floor((this.earnedGoldMedals / 50) * 50);
			if (rewardCount > 0) {
				this.bonusSources['Gold Medals'] = Math.floor(BONUS_WEIGHT.WeightPerGoldMedal * rewardCount);
			}
		}

		return this.bonusSources;
	};

	getCropWeights = () => {
		const cropWeight = {} as Record<Crop, number>;
		let totalWeight = 0;
		let doubleBreakWeight = 0;

		for (const crop of crops) {
			const collected = this.collection[crop] ?? 0;
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

	getCropWeight = (crop: Crop) => {
		CROP_WEIGHT[crop];
	};
}
