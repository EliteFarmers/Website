import { Crop } from '../constants/crops.js';
import {
	BESTIARY_PEST_BRACKETS,
	FORTUNE_PER_PEST_BRACKET,
	Pest,
	PEST_COLLECTION_ADJUSTMENTS,
	PEST_COLLECTION_BRACKETS,
	PEST_EXCHANGE_RATES,
	PEST_IDS,
	PEST_TO_CROP,
} from '../constants/pests.js';

export function fortuneFromPests(pests: number): number {
	return PEST_EXCHANGE_RATES[pests as keyof typeof PEST_EXCHANGE_RATES] ?? 0;
}

export function unlockedPestBestiaryTiers(bestiaryKills: Record<string, number>): number {
	let reachedBrackets = 0;

	const brackets = BESTIARY_PEST_BRACKETS;

	for (const pestId of PEST_IDS) {
		const kills = bestiaryKills[`pest_${pestId}_1`];
		if (!kills) continue;

		const bracket = Object.entries(brackets[pestId]).sort((a, b) => b[1] - a[1]);

		// Find the highest reached bracket for this pest
		const unlocked = bracket.find((b) => +kills >= b[1]);

		reachedBrackets += unlocked ? +unlocked[0] : 0;
	}

	return reachedBrackets;
}

export function fortuneFromPestBestiary(bestiaryKills: Record<string, number>): number {
	return unlockedPestBestiaryTiers(bestiaryKills) * FORTUNE_PER_PEST_BRACKET;
}

export function uncountedCropsFromPests(pestKills: Record<string, number>): Partial<Record<Crop, number>> {
	const crops = {} as Partial<Record<Crop, number>>;
	const brackets = PEST_COLLECTION_BRACKETS;

	for (const pestId of PEST_IDS) {
		if (pestId === Pest.Mouse) continue;

		let kills = pestKills[`pest_${pestId}_1`];
		if (!kills) continue;

		const crop = PEST_TO_CROP[pestId];
		if (!crop) continue;

		let pestsToCount = 0;
		let totalDrops = 0;
		for (let i = 0; i < brackets.length; i++) {
			const bracket = brackets[i] as number;
			// Exit if there are no more pests to calculate
			if (kills <= 0) break;

			const bracketCrops = PEST_COLLECTION_ADJUSTMENTS[pestId][bracket] ?? 0;

			// Use the last bracket for all remaining pests
			if (i === brackets.length - 1) {
				totalDrops += Math.ceil(bracketCrops * kills);
				continue;
			}

			// Get the next bracket to find the maximum pests in the current bracket
			const nextBracket = brackets.at(i + 1);
			if (nextBracket === undefined) break;

			if (!Number.isInteger(nextBracket)) continue;

			// Calculate the pests to count in the current bracket
			pestsToCount = Math.min(nextBracket - pestsToCount, kills);

			if (bracketCrops === 0) {
				// If the value is 0, we don't need to calculate the drops
				kills -= pestsToCount;
				continue;
			}

			// Calculate the drops for the current bracket
			kills -= pestsToCount;
			totalDrops += Math.ceil(bracketCrops * pestsToCount);
		}

		crops[crop] = totalDrops;
	}

	return crops;
}
