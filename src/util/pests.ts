import { Crop } from '../constants/crops';
import {
	FORTUNE_PER_PEST_BRACKET,
	KILLS_PER_PEST_BRACKET,
	PEST_COLLECTION_ADJUSTMENTS,
	PEST_COLLECTION_BRACKETS,
	PEST_EXCHANGE_RATES,
	PEST_IDS,
	PEST_TO_CROP,
} from '../constants/pests';

export function fortuneFromPests(pests: number): number {
	return PEST_EXCHANGE_RATES[pests as keyof typeof PEST_EXCHANGE_RATES] ?? 0;
}

export function fortuneFromPestBestiary(bestiaryKills: Record<string, number>): number {
	let reachedBrackets = 0;

	const brackets = Object.entries(KILLS_PER_PEST_BRACKET).sort((a, b) => b[1] - a[1]);

	for (const pestId of PEST_IDS) {
		const kills = bestiaryKills[`pest_${pestId}_1`];
		if (!kills) continue;

		// Find the highest reached bracket for this pest
		const bracket = brackets.find((b) => +kills >= b[1]);

		reachedBrackets += bracket ? +bracket[0] : 0;
	}

	return reachedBrackets * FORTUNE_PER_PEST_BRACKET;
}

export function uncountedCropsFromPests(pestKills: Record<string, number>): Partial<Record<Crop, number>> {
	const crops = {} as Partial<Record<Crop, number>>;
	const brackets = PEST_COLLECTION_BRACKETS;

	for (const pestId of PEST_IDS) {
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
