import type { ProfileInfo, WeightSource } from '$db/models/users';
import { CROPS_PER_ONE_WEIGHT } from './constants/weights';
import type { ProfileData, ProfileMember } from './skyblock';
import { RoundToFixed } from './util';

export function CalculateWeight(profiles: ProfileData[]) {
	const data: ProfileInfo[] = [];

	for (const profile of profiles) {
		const tempCollections = calcCollections(profile.member);
		const weight = computeWeight(tempCollections);
		const tempBonus = calcBonus(profile.member);
		const bonus = computeBonusWeight(tempBonus);

		const sources: WeightSource[] = [];
		tempCollections?.forEach((value, key) => {
			sources.push({ name: key, amount: value });
		});

		tempBonus.forEach((value, key) => {
			sources.push({ name: key, amount: value, bonus: true });
		});

		data.push({
			profile_id: profile.profile_id,
			weight: {
				farming: {
					total: (weight ?? 0) + bonus,
					bonus: bonus,
					sources: sources,
				},
			},
		});
	}

	return data;
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
	collections.set('Cocoa', RoundToFixed(COCOA / CROPS_PER_ONE_WEIGHT.cocoa));
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
			bonus.set('farminglevel', 250);
		} else if (member.skills.farming > 55172425) {
			bonus.set('farminglevel', 100);
		}
	}

	// Anita buff bonus
	const anitaBuff = member.jacob.perks.double_drops;
	if (anitaBuff > 0) {
		bonus.set('anita', anitaBuff * 2);
	}

	const earnedGolds = member.jacob.earned_medals.gold;
	if (earnedGolds >= 1000) {
		bonus.set('medals', 500);
	} else {
		const roundDown = Math.floor(earnedGolds / 50) * 50;
		if (roundDown > 0) {
			bonus.set('medals', roundDown / 2);
		}
	}

	// Tier 12 farming minions
	const tier12s = [
		'WHEAT', 'CARROT', 'POTATO', 
		'PUMPKIN', 'MELON', 'MUSHROOM', 
		'COCOA', 'CACTUS', 'SUGAR_CANE', 
		'NETHER_WARTS'
	];

	let obtained12s = 0;
	tier12s.forEach(minion => {
		// Bit shift to get the tier
		obtained12s += (member.minions[minion] >> 12 & 1) === 1 ? 1 : 0;
	});

	if (obtained12s > 0) {
		bonus.set('minions', obtained12s * 5);
	}

	return bonus;
}

function computeBonusWeight(bonus: Map<string, number>) {
	let bonusWeight = 0;

	bonus.forEach((value) => {
		bonusWeight += value;
	});

	return bonusWeight;
}
