import type { EliteItemDto } from "../classes/item";
import { PERIDOT } from "../constants/gems";
import { Rarity } from "../constants/reforges";

export function getPeridotFortune(rarity: Rarity, item: EliteItemDto) {
	const gems = item.gems;
	if (!gems) return 0;
	
	const peridot = PERIDOT[rarity];
	if (!peridot) return 0;

	return Object.values(gems).reduce((acc, gem) => acc + peridot[gem], 0);
}