import type { EliteItemDto, GemRarity } from "../classes/item";
import { PERIDOT } from "../constants/gems";
import { Rarity } from "../constants/reforges";

export function getPeridotFortune(rarity: Rarity, item: EliteItemDto) {
	const gems = item.gems;
	if (!gems) return 0;
	
	const peridot = PERIDOT[rarity];
	if (!peridot) return 0;

	return Object.entries(gems)
		.filter(([ gem ]) => gem.startsWith("PERIDOT"))
		.reduce((acc, gem) => acc + peridot[gem[1] as GemRarity], 0);
}