import { FARMING_TOOLS, type Crop, Rarity, type FarmingToolInfo } from '$lib/constants/rates';
import { Stat, type Reforge, type ReforgeTier } from '$lib/constants/reforges';
import { GetFarmingAbilityFortune } from './abilities';
import { GetRarity, GetReforge, PreviousRarity, type Item } from './items';

export class FarmingTool {
	public declare readonly item: Item;
	public declare readonly crop: Crop;
	public declare readonly tool: FarmingToolInfo;

	public declare readonly rarity: Rarity;
	public declare readonly counter: number | undefined;
	public declare readonly cultivating: number | undefined;
	public declare readonly reforge: Reforge | undefined;
	public declare readonly reforgeStats: ReforgeTier | undefined;

	public declare readonly farmingForDummies: number;
	public declare readonly recombobulated: boolean;

	constructor(item: Item) {
		this.item = item;
		const tool = FARMING_TOOLS[item.skyblockId as keyof typeof FARMING_TOOLS];

		if (!tool) {
			throw new Error(`Unknown farming tool: ${item.name} (${item.skyblockId})`);
		}

		this.tool = tool;
		this.crop = tool.crop;

		this.rarity = GetRarity(item);
		this.counter = this.getCounter();
		this.cultivating = this.getCultivating();
		this.reforge = GetReforge(item);
		this.reforgeStats = this.reforge?.tiers[this.rarity];

		this.farmingForDummies = +(this.item.attributes?.farming_for_dummies ?? 0);
		this.recombobulated = this.item.attributes?.rarity_upgrades === '1';
	}

	private sumFortune(): number {
		let sum = 0;

		// Base
		const baseRarity = this.recombobulated ? PreviousRarity(this.rarity) : this.rarity;
		sum += this.tool.stats?.[baseRarity]?.[Stat.FarmingFortune] ?? 0;
		// Reforge
		sum += this.reforgeStats?.stats?.[Stat.FarmingFortune] ?? 0;
		// Farming for Dummies
		sum += this.farmingForDummies;
		// Item Abilities
		sum += GetFarmingAbilityFortune(this);

		return sum;
	}

	private getCounter(): number | undefined {
		const counter = +(this.item?.attributes?.mined_crops ?? 0);
		return counter && !isNaN(counter) ? counter : undefined;
	}

	private getCultivating(): number | undefined {
		const cultivating = +(this.item?.attributes?.farmed_cultivating ?? 0);
		return cultivating && !isNaN(cultivating) ? cultivating : undefined;
	}

	get farmed(): number {
		return this.counter ?? this.cultivating ?? 0;
	}
}
