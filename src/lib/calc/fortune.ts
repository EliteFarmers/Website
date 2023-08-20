import { FARMING_TOOLS, type Crop, Rarity } from "$lib/constants/rates";
import { GetRarity, type Item } from "./items";

export class FarmingTool {
	declare public readonly item: Item;
	declare public readonly crop: Crop;
	
	declare public readonly rarity: Rarity;
	declare public readonly counter: number;
	declare public readonly cultivating: number;

	constructor(item: Item) {
		this.item = item;
		this.crop = FARMING_TOOLS[item.skyblockId as keyof typeof FARMING_TOOLS];

		if (!this.crop) {
			throw new Error(`Unknown farming tool: ${item.name} (${item.skyblockId})`);
		}

		this.rarity = GetRarity(item);
		this.counter = this.getCounter();
		this.cultivating = this.getCultivating();
	}

	getCounter(): number {
		const counter = +(this.item?.attributes?.counter ?? 0);
		return isNaN(counter) ? 0 : counter;
	}

	getCultivating(): number {
		const cultivating = +(this.item?.attributes?.farmed_cultivating ?? 0);
		return isNaN(cultivating) ? 0 : cultivating;
	}
}