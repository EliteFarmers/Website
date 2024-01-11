const pumkinDicerRollem = {
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

export function calculatePumpkinPerkBonus(blocksBroken: number, level: 3 = 3): number {
	let total = 0;

	for (const { drops, chance } of pumkinDicerRollem[level]) {
		total += drops * chance * blocksBroken;
	}

	return total;
}
