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
	const highestData: HighestWeights = { ...highest, farming: { weight: 0, profile: 'N/A' } };

	for (const profile of profiles) {
		const tempCollections = calcCollections(profile.member);
		const weight = computeWeight(tempCollections);
		const tempBonus = calcBonus(profile.member);
		const bonus = computeBonusWeight(tempBonus);

		const sources: Record<string, number> = {};
		tempCollections?.forEach((value, key) => {
			sources[key] = (value as number | undefined) ?? 0;
			if ((sources[key] as number | null) === null || isNaN(sources[key])) sources[key] = 0;
		});

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
		};

		if (realTotal > highestData.farming.weight) {
			highestData.farming.weight = realTotal;
			highestData.farming.profile = profile.profile_id;
		}
	}

	return { data, highestData };
}

export function calcCollections(member: ProfileMember) {
	if (!member.collection) return undefined;

	const {
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

	const COCOA = member.collection['INK_SACK:3']; // Dumb cocoa

	const collections = new Map<string, number>();

	//Normalize collections
	collections.set('Wheat', RoundToFixed(WHEAT / CROPS_PER_ONE_WEIGHT.wheat));
	collections.set('Carrot', RoundToFixed(CARROT / CROPS_PER_ONE_WEIGHT.carrot));
	collections.set('Potato', RoundToFixed(POTATO / CROPS_PER_ONE_WEIGHT.potato));
	collections.set('Pumpkin', RoundToFixed(PUMPKIN / CROPS_PER_ONE_WEIGHT.pumpkin));
	collections.set('Melon', RoundToFixed(MELON / CROPS_PER_ONE_WEIGHT.melon));
	collections.set('Mushroom', RoundToFixed(MUSHROOM / CROPS_PER_ONE_WEIGHT.mushroom));
	collections.set('Cocoa Beans', RoundToFixed(COCOA / CROPS_PER_ONE_WEIGHT.cocoa));
	collections.set('Cactus', RoundToFixed(CACTUS / CROPS_PER_ONE_WEIGHT.cactus));
	collections.set('Sugar Cane', RoundToFixed(CANE / CROPS_PER_ONE_WEIGHT.sugarcane));
	collections.set('Nether Wart', RoundToFixed(WART / CROPS_PER_ONE_WEIGHT.netherwart));

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
