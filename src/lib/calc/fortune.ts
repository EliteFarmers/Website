import { FARMING_TOOLS, type Crop, Rarity } from '$lib/constants/rates';
import type { Reforge, ReforgeTier } from '$lib/constants/reforges';
import { GetRarity, GetReforge, type Item } from './items';

export class FarmingTool {
	public declare readonly item: Item;
	public declare readonly crop: Crop;

	public declare readonly rarity: Rarity;
	public declare readonly counter: number | undefined;
	public declare readonly cultivating: number | undefined;
	public declare readonly reforge: Reforge | undefined;
	public declare readonly reforgeStats: ReforgeTier | undefined;

	public declare readonly farmingForDummies: number;
	public declare readonly recombobulated: boolean;

	constructor(item: Item) {
		this.item = item;
		this.crop = FARMING_TOOLS[item.skyblockId as keyof typeof FARMING_TOOLS];

		if (!this.crop) {
			throw new Error(`Unknown farming tool: ${item.name} (${item.skyblockId})`);
		}

		this.rarity = GetRarity(item);
		this.counter = this.getCounter();
		this.cultivating = this.getCultivating();
		this.reforge = GetReforge(item);
		this.reforgeStats = this.reforge?.tiers[this.rarity];

		this.farmingForDummies = +(this.item.attributes?.farming_for_dummies ?? 0);
		this.recombobulated = this.item.attributes?.rarity_upgrades === '1';
	}

	getCounter(): number | undefined {
		const counter = +(this.item?.attributes?.mined_crops ?? 0);
		return counter && !isNaN(counter) ? counter : undefined;
	}

	getCultivating(): number | undefined {
		const cultivating = +(this.item?.attributes?.farmed_cultivating ?? 0);
		return cultivating && !isNaN(cultivating) ? cultivating : undefined;
	}

	get farmed(): number {
		return this.counter ?? this.cultivating ?? 0;
	}
}
