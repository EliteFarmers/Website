import type { FarmingTool } from './fortune';

export function GetFarmingAbilityFortune(tool: FarmingTool) {
	let fortune = 0;

	const regex = /§7You have §6\+(\d+)☘ Farming Fortune/g;

	for (const line of tool.item.lore ?? []) {
		const match = regex.exec(line);
		if (!match) continue;

		const found = +match[1];

		if (isNaN(found)) continue;

		fortune += found;
	}

	return fortune;
}
