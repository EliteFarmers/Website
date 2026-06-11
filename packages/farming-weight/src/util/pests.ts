import type { Crop } from '../constants/crops.js';
import {
	BESTIARY_PEST_BRACKETS,
	DEFAULT_GARDEN_BESTIARY_PEST_BRACKET,
	FORTUNE_PER_PEST_BRACKET,
	GARDEN_BESTIARY_BRACKETS,
	GARDEN_BESTIARY_NAMES,
	PEST_BESTIARY_IDS,
	PEST_COLLECTION_ADJUSTMENTS,
	PEST_COLLECTION_BRACKETS,
	PEST_EXCHANGE_RATES,
	PEST_TO_CROP,
	type Pest,
} from '../constants/pests.js';

type BestiaryBracketEntries = readonly (readonly [number, number])[];

const PEST_BESTIARY_ENTRIES = Object.entries(PEST_BESTIARY_IDS) as [string, Pest | null][];
const SORTED_DEFAULT_GARDEN_BESTIARY_PEST_BRACKET = sortBestiaryBracketEntries(
	DEFAULT_GARDEN_BESTIARY_PEST_BRACKET,
	'desc'
);
const SORTED_PEST_BESTIARY_BRACKETS = Object.fromEntries(
	Object.entries(BESTIARY_PEST_BRACKETS).map(([pest, brackets]) => [
		pest,
		sortBestiaryBracketEntries(brackets, 'desc'),
	])
) as Record<Pest, BestiaryBracketEntries>;
const SORTED_GARDEN_BESTIARY_BRACKETS = Object.fromEntries(
	Object.entries(GARDEN_BESTIARY_BRACKETS).map(([bestiaryId, brackets]) => [
		bestiaryId,
		sortBestiaryBracketEntries(brackets, 'desc'),
	])
) as Record<string, BestiaryBracketEntries>;
const ASCENDING_DEFAULT_GARDEN_BESTIARY_PEST_BRACKET = sortBestiaryBracketEntries(
	DEFAULT_GARDEN_BESTIARY_PEST_BRACKET,
	'asc'
);
const ASCENDING_PEST_BESTIARY_BRACKETS = Object.fromEntries(
	Object.entries(BESTIARY_PEST_BRACKETS).map(([pest, brackets]) => [
		pest,
		sortBestiaryBracketEntries(brackets, 'asc'),
	])
) as Record<Pest, BestiaryBracketEntries>;
const ASCENDING_GARDEN_BESTIARY_BRACKETS = Object.fromEntries(
	Object.entries(GARDEN_BESTIARY_BRACKETS).map(([bestiaryId, brackets]) => [
		bestiaryId,
		sortBestiaryBracketEntries(brackets, 'asc'),
	])
) as Record<string, BestiaryBracketEntries>;

export function fortuneFromPests(pests: number): number {
	return PEST_EXCHANGE_RATES[pests as keyof typeof PEST_EXCHANGE_RATES] ?? 0;
}

export function unlockedPestBestiaryTiers(bestiaryKills: Record<string, number>, onlyPests = true): number {
	let reachedBrackets = 0;

	for (const [bestiaryId, pestId] of PEST_BESTIARY_ENTRIES) {
		if (onlyPests && !pestId) continue;
		const kills = bestiaryKills[bestiaryId];
		if (!kills) continue;

		const bracket = getSortedBestiaryBrackets(bestiaryId, pestId, 'desc');
		const unlocked = bracket.find(([, bracketKills]) => kills >= bracketKills);

		reachedBrackets += unlocked ? unlocked[0] : 0;
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

	for (const [bestiaryId, pestId] of PEST_BESTIARY_ENTRIES) {
		const kills = bestiaryKills[bestiaryId] || 0;
		const pestName = GARDEN_BESTIARY_NAMES[bestiaryId] || 'Unknown Pest';
		const sortedBrackets = getSortedBestiaryBrackets(bestiaryId, pestId, 'asc');
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

	for (const [bestiaryKey, pestId] of PEST_BESTIARY_ENTRIES) {
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

function sortBestiaryBracketEntries(
	brackets: Record<number, number>,
	direction: 'asc' | 'desc'
): BestiaryBracketEntries {
	const multiplier = direction === 'asc' ? 1 : -1;
	return Object.entries(brackets)
		.map(([level, kills]) => [Number(level), kills] as const)
		.sort((a, b) => (a[1] - b[1]) * multiplier);
}

function getSortedBestiaryBrackets(
	bestiaryId: string,
	pestId: Pest | null,
	direction: 'asc' | 'desc'
): BestiaryBracketEntries {
	if (direction === 'asc') {
		return (
			(pestId ? ASCENDING_PEST_BESTIARY_BRACKETS[pestId] : ASCENDING_GARDEN_BESTIARY_BRACKETS[bestiaryId]) ??
			ASCENDING_DEFAULT_GARDEN_BESTIARY_PEST_BRACKET
		);
	}

	return (
		(pestId ? SORTED_PEST_BESTIARY_BRACKETS[pestId] : SORTED_GARDEN_BESTIARY_BRACKETS[bestiaryId]) ??
		SORTED_DEFAULT_GARDEN_BESTIARY_PEST_BRACKET
	);
}
