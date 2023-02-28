export const CROPS_PER_ONE_WEIGHT = {
	wheat: 100_000,
	carrot: 300_000,
	potato: 300_000,
	sugarcane: 200_000,
	netherwart: 250_000,
	pumpkin: 87_095.11,
	melon: 435_466.47,
	mushroom: 168_925.53,
	cocoa: 303_091.99,
	cactus: 169_389.33,
};

// Bonus

// Rewards for farming level
export const FARMING_LEVEL_50_BONUS = 100;
export const FARMING_LEVEL_60_BONUS = 250;
// For every gold medal <= max, add 0.5 to the weight
export const MAX_MEDAL_BONUS = 1000;
export const WEIGHT_PER_GOLD_MEDAL = 0.5;
// Get 5 bonus weight for every tier 12 farming minion
export const MINION_REWARD_AT_TIER = 12;
export const MINION_REWARD_WEIGHT = 5;

export const PROPER_BONUS_NAME: Partial<Record<string, string>> = {
	minions: 'Tier 12 Minions',
	medals: 'Gold Medals',
	farminglevel: 'Farming Level',
	anita: 'Anita Buff',
};
