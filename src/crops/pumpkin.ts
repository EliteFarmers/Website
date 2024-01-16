const pumkinDicerRollem = {
	1: [
		{
			drops: 160,
			chance: 90 / 100141,
		},
		{
			drops: 2 * 160,
			chance: 40 / 100141,
		},
		{
			drops: 18 * 160,
			chance: 7 / 100141,
		},
		{
			drops: 80 * 160,
			chance: 1 / 100141,
		},
	],
	2: [
		{
			drops: 2 * 160,
			chance: 90 / 100141,
		},
		{
			drops: 4 * 160,
			chance: 40 / 100141,
		},
		{
			drops: 35 * 160,
			chance: 7 / 100141,
		},
		{
			drops: 160 * 160,
			chance: 1 / 100141,
		},
	],
	3: [
		{
			drops: 480,
			chance: 90 / 100141,
		},
		{
			drops: 800,
			chance: 40 / 100141,
		},
		{
			drops: 7200,
			chance: 7 / 100141,
		},
		{
			drops: 51200,
			chance: 1 / 100141,
		},
	],
};

export function calculatePumpkinPerkBonus(blocksBroken: number, level: 1 | 2 | 3 = 3): number {
	let total = 0;

	for (const { drops, chance } of pumkinDicerRollem[level]) {
		total += drops * chance * blocksBroken;
	}

	return total;
}
