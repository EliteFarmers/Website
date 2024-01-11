export function fortuneFromPests(pests: number): number {
	return PEST_EXCHANGE_RATES[pests as keyof typeof PEST_EXCHANGE_RATES] ?? 0;
}

export function fortuneFromPestBestiary(bestiaryKills: Record<string, number>): number {
	let reachedBrackets = 0;

	const brackets = Object.entries(killsPerBracket).sort((a, b) => b[1] - a[1]);

	for (const pestId of PEST_IDS) {
		const kills = bestiaryKills[`pest_${pestId}_1`];
		if (!kills) continue;

		// Find the highest reached bracket for this pest
		const bracket = brackets.find((b) => +kills >= b[1]);

		reachedBrackets += bracket ? +bracket[0] : 0;
	}

	return reachedBrackets * fortunePerBracket;
}

export const PEST_EXCHANGE_RATES = {
	0: 0,
	1: 10,
	2: 20,
	3: 30,
	4: 40,
	5: 50,
	6: 60,
	7: 70,
	8: 80,
	9: 90,
	10: 100,
	11: 105,
	12: 110,
	13: 115,
	14: 120,
	15: 125,
	16: 130,
	17: 135,
	18: 140,
	19: 145,
	20: 150,
	21: 153,
	22: 156,
	23: 159,
	24: 162,
	25: 165,
	26: 168,
	27: 171,
	28: 174,
	29: 177,
	30: 180,
	31: 182,
	32: 184,
	33: 186,
	34: 188,
	35: 190,
	36: 192,
	37: 194,
	38: 196,
	39: 198,
	40: 200,
};

export const PEST_IDS = [
	'beetle',
	'cricket',
	'worm',
	'fly',
	'locust',
	'mite',
	'mosquito',
	'moth',
	'rat',
	'slug',
] as const;

const fortunePerBracket = 0.4;

const killsPerBracket: Record<number, number> = {
	1: 1,
	2: 2,
	3: 3,
	4: 5,
	5: 7,
	6: 9,
	7: 14,
	8: 17,
	9: 21,
	10: 25,
	11: 50,
	12: 80,
	13: 125,
	14: 175,
	15: 250,
};
