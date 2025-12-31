import type { Crop } from '../constants/crops.js';
import {
	BESTIARY_PEST_BRACKETS,
	DEFAULT_GARDEN_BESTIARY_PEST_BRACKET,
	FORTUNE_PER_PEST_BRACKET,
	GARDEN_BESTIARY_NAMES,
	PEST_BESTIARY_IDS,
	PEST_COLLECTION_ADJUSTMENTS,
	PEST_COLLECTION_BRACKETS,
	PEST_EXCHANGE_RATES,
	PEST_TO_CROP,
	type Pest,
} from '../constants/pests.js';

export function fortuneFromPests(pests: number): number {
	return PEST_EXCHANGE_RATES[pests as keyof typeof PEST_EXCHANGE_RATES] ?? 0;
}

export function unlockedPestBestiaryTiers(bestiaryKills: Record<string, number>, onlyPests = true): number {
	let reachedBrackets = 0;

	const brackets = BESTIARY_PEST_BRACKETS;

	for (const [bestiaryId, pestId] of Object.entries(PEST_BESTIARY_IDS) as [string, Pest | null][]) {
		if (onlyPests && !pestId) continue;
		const kills = bestiaryKills[bestiaryId];
		if (!kills) continue;

		const bracket = Object.entries(pestId ? brackets[pestId] : DEFAULT_GARDEN_BESTIARY_PEST_BRACKET).sort(
			(a, b) => b[1] - a[1]
		);

		// Find the highest reached bracket for this pest
		const unlocked = bracket.find((b) => +kills >= b[1]);

		reachedBrackets += unlocked ? +unlocked[0] : 0;
	}

	return reachedBrackets;
}

export function fortuneFromPestBestiary(bestiaryKills: Record<string, number>): number {
	return unlockedPestBestiaryTiers(bestiaryKills, false) * FORTUNE_PER_PEST_BRACKET;
}

export function getGardenBestiaryProgress(
	bestiaryKills: Record<string, number>
): Record<string, { kills: number; nextBracketKills: number | null; bracketsUnlocked: number; name: string }> {
	const progress: Record<
		string,
		{ kills: number; nextBracketKills: number | null; bracketsUnlocked: number; name: string }
	> = {};
	const brackets = BESTIARY_PEST_BRACKETS;

	for (const [bestiaryId, pestId] of Object.entries(PEST_BESTIARY_IDS) as [string, Pest | null][]) {
		const kills = bestiaryKills[bestiaryId] || 0;
		const pestName = GARDEN_BESTIARY_NAMES[bestiaryId] || 'Unknown Pest';
		const bracket = pestId ? brackets[pestId] : DEFAULT_GARDEN_BESTIARY_PEST_BRACKET;

		const sortedBrackets = Object.entries(bracket).sort((a, b) => +a[1] - +b[1]);
		let bracketsUnlocked = 0;
		let nextBracketKills: number | null = null;
		for (const [bracketLevel, bracketKills] of sortedBrackets) {
			if (kills >= bracketKills) {
				bracketsUnlocked = +bracketLevel;
			} else {
				nextBracketKills = bracketKills;
				break;
			}
		}

		progress[bestiaryId] = {
			kills,
			nextBracketKills,
			bracketsUnlocked,
			name: pestName,
		};
	}
	return progress;
}

export function uncountedCropsFromPests(pestKills: Record<string, number>): Partial<Record<Crop, number>> {
	const crops = {} as Partial<Record<Crop, number>>;
	const brackets = PEST_COLLECTION_BRACKETS;

	for (const [bestiaryKey, pestId] of Object.entries(PEST_BESTIARY_IDS) as [string, Pest | null][]) {
		let kills = pestKills[bestiaryKey];
		if (!kills || !pestId) continue;

		const crop = PEST_TO_CROP[pestId];
		if (!crop) continue;

		let pestsToCount = 0;
		let totalDrops = 0;
		for (let i = 0; i < brackets.length; i++) {
			const bracket = brackets[i] as number;
			// Exit if there are no more pests to calculate
			if (kills <= 0) break;

			const bracketCrops =
				PEST_COLLECTION_ADJUSTMENTS[pestId as keyof typeof PEST_COLLECTION_ADJUSTMENTS][bracket] ?? 0;

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
