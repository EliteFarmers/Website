import { Crop } from '../constants/crops';
import { REFORGES, Rarity, Reforge, ReforgeTier, Stat } from '../constants/reforges';
import { FARMING_TOOLS, FarmingToolInfo, FarmingToolType } from '../constants/tools';
import { GetRarityFromLore, PreviousRarity } from '../util/itemstats';
import { Item } from './item';

export class FarmingTool {
	public declare readonly item: Item;
	public declare readonly crop: Crop;
	public declare readonly tool: FarmingToolInfo;

	public declare readonly rarity: Rarity;
	public declare readonly counter: number | undefined;
	public declare readonly cultivating: number;
	public declare readonly reforge: Reforge | undefined;
	public declare readonly reforgeStats: ReforgeTier | undefined;

	public declare readonly farmingForDummies: number;
	public declare readonly recombobulated: boolean;

	public declare fortune: number;
	public declare fortuneBreakdown: Record<string, number>;

	constructor(item: Item) {
		this.item = item;
		const tool = FARMING_TOOLS[item.skyblockId as keyof typeof FARMING_TOOLS];

		if (!tool) {
			throw new Error(`Unknown farming tool: ${item.name} (${item.skyblockId})`);
		}

		this.tool = tool;
		this.crop = tool.crop;

		if (item.lore) {
			this.rarity = GetRarityFromLore(item.lore);
		}

		this.counter = this.getCounter();
		this.cultivating = this.getCultivating() ?? 0;
		this.reforge = REFORGES[item.attributes?.modifier ?? ''] ?? undefined;
		this.reforgeStats = this.reforge?.tiers?.[this.rarity];

		this.farmingForDummies = +(this.item.attributes?.farming_for_dummies_count ?? 0);
		this.recombobulated = this.item.attributes?.rarity_upgrades === '1';

		this.fortune = this.sumFortune();
	}

	private sumFortune(): number {
		this.fortuneBreakdown = {};
		let sum = 0;

		// Base fortune
		const base = this.tool.baseStats?.[Stat.FarmingFortune] ?? 0;
		if (base > 0) {
			this.fortuneBreakdown['Tool Bonus'] = base;
			sum += base;
		}

		// Tool rarity stats
		const baseRarity = this.recombobulated ? PreviousRarity(this.rarity) : this.rarity;
		const rarityStats = this.tool.stats?.[baseRarity]?.[Stat.FarmingFortune] ?? 0;

		if (rarityStats > 0) {
			this.fortuneBreakdown['Tool Stats'] = rarityStats;
			sum += rarityStats;
		}

		// Reforge stats
		const reforge = this.reforgeStats?.stats?.[Stat.FarmingFortune] ?? 0;
		if (reforge > 0) {
			this.fortuneBreakdown[this.reforge?.name ?? 'Reforge'] = reforge;
			sum += reforge;
		}

		// Farming for Dummies
		if (this.farmingForDummies > 0) {
			this.fortuneBreakdown['Farming for Dummies'] = this.farmingForDummies;
			sum += this.farmingForDummies;
		}

		// Collection analysis and digit bonuses
		if (this.tool.type === FarmingToolType.MathematicalHoe) {
			const ability = this.getFarmingAbilityFortune(this);
			if (ability > 0) {
				this.fortuneBreakdown['Tool Ability'] = ability;
				sum += ability;
			}
		}

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

	getCultivatingLevel(): number {
		return this.item.enchantments?.cultivating ?? 0;
	}

	get farmed(): number {
		return this.counter ?? this.cultivating ?? 0;
	}

	private getFarmingAbilityFortune(tool: FarmingTool) {
		let fortune = 0;

		const regex = /§7You have §6\+(\d+)☘ Farming Fortune/g;

		for (const line of tool.item.lore ?? []) {
			const match = regex.exec(line);
			if (!match?.length || !match[1]) continue;

			const found = +match[1];
			if (isNaN(found)) continue;

			fortune += found;
		}

		return fortune;
	}

	static isValid(item: Item): boolean {
		return IsValidFarmingTool(item);
	}
}

export function IsValidFarmingTool(item: Item): boolean {
	return FARMING_TOOLS[item.skyblockId as keyof typeof FARMING_TOOLS] !== undefined;
}