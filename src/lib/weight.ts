import type { ProfileData, ProfileMember } from './skyblock';
import type { HighestWeights, ProfileWeightInfo } from '$db/models/users';
import { RoundToFixed } from './util';
import {
	CROPS_PER_ONE_WEIGHT,
	FARMING_LEVEL_50_BONUS,
	FARMING_LEVEL_60_BONUS,
	MAX_MEDAL_BONUS,
	MINION_REWARD_AT_TIER,
	MINION_REWARD_WEIGHT,
	WEIGHT_PER_GOLD_MEDAL,
} from './constants/weights';

export function CalculateWeight(profiles: ProfileData[], highest?: HighestWeights) {
	const data: ProfileWeightInfo = {};
	const highestData: HighestWeights = { ...highest, farming: { weight: 0, profile: 'N/A', crop: 'wheat' } };

	for (const profile of profiles) {
		const tempCollections = calcCollections(profile.member);
		const weight = computeWeight(tempCollections);
		const tempBonus = calcBonus(profile.member);
		const bonus = computeBonusWeight(tempBonus);

		const sources: Record<string, number> = {};
		let highestCrop: string | undefined = undefined;

		for (const [key, value] of tempCollections ?? new Map<string, number>()) {
			sources[key] = (value as number | undefined) ?? 0;
			if ((sources[key] as number | null) === null || isNaN(sources[key])) {
				sources[key] = 0;
			}

			if (!highestCrop || sources[key] > sources[highestCrop]) {
				highestCrop = key;
			}
		}

		const bonuses: Record<string, number> = {};
		tempBonus.forEach((value, key) => {
			bonuses[key] = value;
		});

		const total = (weight ?? 0) + bonus;
		const realTotal = isNaN(total) ? 0 : total;

		data[profile.profile_id] = {
			farming: {
				total: realTotal,
				bonus: bonus,
				sources: sources,
				bonuses: bonuses,
			},
			cute_name: profile.cute_name,
		};

		if (realTotal > highestData.farming.weight) {
			highestData.farming.weight = realTotal;
			highestData.farming.profile = profile.profile_id;
			highestData.farming.crop = highestCrop ?? 'Wheat';
		}
	}

	return { data, highestData };
}

export function calcCollections(member: ProfileMember) {
	if (!member.collection) return undefined;

	let {
		WHEAT,
		POTATO_ITEM: POTATO,
		CARROT_ITEM: CARROT,
		MUSHROOM_COLLECTION: MUSHROOM,
		PUMPKIN,
		MELON,
		SUGAR_CANE: CANE,
		CACTUS,
		NETHER_STALK: WART,
	} = member.collection;

	let COCOA = member.collection['INK_SACK:3']; // Dumb cocoa

	if (isNaN(WHEAT)) WHEAT = 0;
	if (isNaN(POTATO)) POTATO = 0;
	if (isNaN(CARROT)) CARROT = 0;
	if (isNaN(MUSHROOM)) MUSHROOM = 0;
	if (isNaN(PUMPKIN)) PUMPKIN = 0;
	if (isNaN(MELON)) MELON = 0;
	if (isNaN(CANE)) CANE = 0;
	if (isNaN(CACTUS)) CACTUS = 0;
	if (isNaN(WART)) WART = 0;
	if (isNaN(COCOA)) COCOA = 0;

	const collections = new Map<string, number>();

	const wheat = WHEAT / CROPS_PER_ONE_WEIGHT.wheat;
	const potato = POTATO / CROPS_PER_ONE_WEIGHT.potato;
	const carrot = CARROT / CROPS_PER_ONE_WEIGHT.carrot;
	const mushroom = MUSHROOM / CROPS_PER_ONE_WEIGHT.mushroom;
	const pumpkin = PUMPKIN / CROPS_PER_ONE_WEIGHT.pumpkin;
	const melon = MELON / CROPS_PER_ONE_WEIGHT.melon;
	const cane = CANE / CROPS_PER_ONE_WEIGHT.sugarcane;
	const cactus = CACTUS / CROPS_PER_ONE_WEIGHT.cactus;
	const wart = WART / CROPS_PER_ONE_WEIGHT.netherwart;
	const cocoa = COCOA / CROPS_PER_ONE_WEIGHT.cocoa;

	//Normalize collections
	collections.set('Wheat', RoundToFixed(wheat));
	collections.set('Carrot', RoundToFixed(carrot));
	collections.set('Potato', RoundToFixed(potato));
	collections.set('Pumpkin', RoundToFixed(pumpkin));
	collections.set('Melon', RoundToFixed(melon));
	collections.set('Cocoa Beans', RoundToFixed(cocoa));
	collections.set('Cactus', RoundToFixed(cactus));
	collections.set('Sugar Cane', RoundToFixed(cane));
	collections.set('Nether Wart', RoundToFixed(wart));

	// Mushroom is a special case, it needs to be calculated dynamically based on the
	// ratio between the farmed crops that give two mushrooms per break with cow pet
	// and the farmed crops that give one mushroom per break with cow pet
	const total = wheat + carrot + potato + pumpkin + melon + cocoa + cactus + cane + wart + mushroom;

	const doubleBreakRatio = (cactus + cane) / total;
	const normalRatio = (total - cactus - cane) / total;

	const mushWght = CROPS_PER_ONE_WEIGHT.mushroom;
	const mushroomWeight = doubleBreakRatio * (MUSHROOM / (2 * mushWght)) + normalRatio * (MUSHROOM / mushWght);

	collections.set('Mushroom', RoundToFixed(mushroomWeight));

	return collections;
}

function computeWeight(collections: Map<string, number> | undefined) {
	if (!collections) return undefined;

	let weight = 0;
	collections.forEach(function (value) {
		weight += value;
	});
	weight = Math.floor(weight * 100) / 100;

	return weight;
}

function calcBonus(member: ProfileMember) {
	// Bonus sources
	const bonus = new Map<string, number>();

	// Farming level bonuses
	if (member.skills) {
		const farmingCap = member.jacob.perks.farming_level_cap;
		if (member.skills.farming > 111672425 && farmingCap === 10) {
			bonus.set('farminglevel', FARMING_LEVEL_60_BONUS);
		} else if (member.skills.farming > 55172425) {
			bonus.set('farminglevel', FARMING_LEVEL_50_BONUS);
		}
	}

	// Anita buff bonus
	const anitaBuff = member.jacob.perks.double_drops;
	if (anitaBuff > 0) {
		bonus.set('anita', anitaBuff * 2);
	}

	try {
		const earnedGolds = member.jacob.earned_medals.gold;
		if (earnedGolds >= MAX_MEDAL_BONUS) {
			bonus.set('medals', MAX_MEDAL_BONUS * WEIGHT_PER_GOLD_MEDAL);
		} else {
			const roundDown = Math.floor(earnedGolds / 50) * 50;
			if (roundDown > 0) {
				bonus.set('medals', roundDown * WEIGHT_PER_GOLD_MEDAL);
			}
		}
	} catch (e) {
		// console.log(e);
	}

	// Tier 12 farming minions
	const tier12s = [
		'WHEAT',
		'CARROT',
		'POTATO',
		'PUMPKIN',
		'MELON',
		'MUSHROOM',
		'COCOA',
		'CACTUS',
		'SUGAR_CANE',
		'NETHER_WARTS',
	];

	let obtained12s = 0;
	tier12s.forEach((minion) => {
		// Bit shift to get the tier
		obtained12s += ((member.minions[minion] >> MINION_REWARD_AT_TIER) & 1) === 1 ? 1 : 0;
	});

	if (obtained12s > 0) {
		bonus.set('minions', obtained12s * MINION_REWARD_WEIGHT);
	}

	return bonus;
}

function computeBonusWeight(bonus: Map<string, number>) {
	let bonusWeight = 0;

	if (bonus.size <= 0) {
		return bonusWeight;
	}

	bonus.forEach((value) => {
		bonusWeight += value;
	});

	return bonusWeight;
}
