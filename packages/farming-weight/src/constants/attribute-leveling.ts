import { Rarity } from './reforges.js';

export const ATTRIBUTE_SHARD_LEVELING: Partial<Record<Rarity, number[]>> = {
	[Rarity.Common]: [1, 3, 5, 6, 7, 8, 10, 14, 18, 24],
	[Rarity.Uncommon]: [1, 2, 3, 4, 5, 6, 7, 8, 12, 16],
	[Rarity.Rare]: [1, 2, 3, 3, 4, 4, 5, 6, 8, 12],
	[Rarity.Epic]: [1, 1, 2, 2, 3, 3, 4, 4, 5, 7],
	[Rarity.Legendary]: [1, 1, 1, 2, 2, 2, 3, 3, 4, 5],
};

export function getShardLevel(rarity: Rarity, amount?: number | null): number {
	if (!amount || amount <= 0) return 0;

	const levels = ATTRIBUTE_SHARD_LEVELING[rarity];
	if (!levels) return 0;

	for (let i = 0; i < levels.length; i++) {
		const threshold = levels[i] as number;
		if (amount < threshold) return i;
		amount -= threshold;
	}

	return levels.length;
}

export function getShardsForLevel(rarity: Rarity, level: number): number {
	const levels = ATTRIBUTE_SHARD_LEVELING[rarity];
	if (!levels || level <= 0) return 0;

	return levels.slice(0, level).reduce((sum, current) => sum + current, 0);
}

export function getShardsForNextLevel(rarity: Rarity, amount: number): number {
	const levels = ATTRIBUTE_SHARD_LEVELING[rarity];
	if (!levels || amount < 0) return 0;

	for (let i = 0; i < levels.length; i++) {
		const threshold = levels[i] as number;
		if (amount < threshold) return threshold - amount;
		amount -= threshold;
	}

	return 0;
}
