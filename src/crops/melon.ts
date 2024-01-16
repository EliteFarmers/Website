const melonDicerRollem = {
	1: [
		{
			drops: 2 * 160,
			chance: 155 / 100208,
		},
		{
			drops: 6 * 160,
			chance: 45 / 100208,
		},
		{
			drops: 64 * 160,
			chance: 7 / 100208,
		},
		{
			drops: 3 * 160 * 160,
			chance: 1 / 100208,
		},
	],
	2: [
		{
			drops: 3 * 160,
			chance: 155 / 100208,
		},
		{
			drops: 13 * 160,
			chance: 45 / 100208,
		},
		{
			drops: 160 * 160,
			chance: 7 / 100208,
		},
		{
			drops: 6 * 160 * 160,
			chance: 1 / 100208,
		},
	],
	3: [
		{
			drops: 640,
			chance: 155 / 100208,
		},
		{
			drops: 2560,
			chance: 45 / 100208,
		},
		{
			drops: 51200,
			chance: 7 / 100208,
		},
		{
			drops: 204800,
			chance: 1 / 100208,
		},
	],
};

export function calculateMelonPerkBonus(blocksBroken: number, level: 1 | 2 | 3 = 3): number {
	let total = 0;

	for (const { drops, chance } of melonDicerRollem[level]) {
		total += drops * chance * blocksBroken;
	}

	return total;
}
