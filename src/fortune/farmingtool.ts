import type { Crop } from '../constants/crops.js';
import { FARMING_ENCHANTS } from '../constants/enchants.js';
import { type Rarity, REFORGES, type Reforge, ReforgeTarget, type ReforgeTier } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import type { FortuneSourceProgress, FortuneUpgrade } from '../constants/upgrades.js';
import { FARMING_TOOLS, type FarmingToolInfo, FarmingToolType } from '../items/tools.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import { getSourceProgress } from '../upgrades/getsourceprogress.js';
import { registerItem } from '../upgrades/itemregistry.js';
import { TOOL_FORTUNE_SOURCES } from '../upgrades/sources/toolsources.js';
import { getSelfFortuneUpgrade, getUpgradeableRarityUpgrade } from '../upgrades/upgrades.js';
import { filterAndSortUpgrades } from '../upgrades/upgradeutils.js';
import { getFortuneFromEnchant, getStatFromEnchant } from '../util/enchants.js';
import { getGemStat, getPeridotFortune } from '../util/gems.js';
import { getRarityFromLore } from '../util/itemstats.js';
import type { EliteItemDto } from './item.js';
import type { UpgradeableInfo } from './upgradeable.js';
import { UpgradeableBase } from './upgradeablebase.js';

export class FarmingTool extends UpgradeableBase {
	public declare item: EliteItemDto;
	public declare crops: Crop[];
	public declare info: FarmingToolInfo;

	public override get type(): ReforgeTarget {
		const t = this.info.type;
		if (t === FarmingToolType.Dicer) return ReforgeTarget.Axe;
		if (t === FarmingToolType.MathematicalHoe) return ReforgeTarget.Hoe;
		if (Object.values(ReforgeTarget).includes(t as ReforgeTarget)) return t as ReforgeTarget;
		return ReforgeTarget.Hoe;
	}

	// Backwards compatibility
	public get tool(): FarmingToolInfo {
		return this.info;
	}

	public declare itemname: string;
	private declare colorPrefix: string;
	public get name() {
		return this.colorPrefix + (this.reforge?.name ?? '') + ' ' + this.itemname;
	}

	public get bountiful() {
		return this.reforge?.name === REFORGES.bountiful?.name;
	}

	public declare rarity: Rarity;
	public declare counter: number | undefined;
	public declare cultivating: number;
	public declare reforge: Reforge | undefined;
	public declare reforgeStats: ReforgeTier | undefined;
	public declare logCounter: number;
	public declare collAnalysis: number;

	public declare farmingForDummies: number;
	public declare recombobulated: boolean;

	public declare fortune: number;
	public declare fortuneBreakdown: Record<string, number>;

	public declare level: number;
	public declare xp: number;
	public declare overclocks: number;

	public declare options?: PlayerOptions;

	constructor(item: EliteItemDto, options?: PlayerOptions) {
		super({ item, options, items: FARMING_TOOLS });
		this.rebuildTool(item, options);
	}

	getProgress(stats?: Stat[], zeroed = false): FortuneSourceProgress[] {
		return getSourceProgress<FarmingTool>(this, TOOL_FORTUNE_SOURCES, zeroed, stats);
	}

	getUpgrades(options?: { stat?: Stat }): FortuneUpgrade[] {
		const { deadEnd, upgrade: self } = getSelfFortuneUpgrade(this) ?? {};
		if (deadEnd && self) return filterAndSortUpgrades([self], options);

		const stats = options?.stat ? [options.stat] : undefined;

		const upgrades = getSourceProgress<FarmingTool>(this, TOOL_FORTUNE_SOURCES, false, stats).flatMap(
			(source) => source.upgrades ?? []
		);

		if (self) {
			upgrades.push(self);
		}

		const rarityUpgrade = getUpgradeableRarityUpgrade(this);
		if (rarityUpgrade) {
			upgrades.push(rarityUpgrade);
		}

		return filterAndSortUpgrades(upgrades, options);
	}

	setOptions(options: PlayerOptions) {
		this.options = options;
		this.fortune = this.getFortune();
	}

	rebuildTool(item: EliteItemDto, options?: PlayerOptions) {
		this.options = options;
		this.item = item;

		const tool = FARMING_TOOLS[item.skyblockId as keyof typeof FARMING_TOOLS];

		if (!tool) {
			throw new Error(`Unknown farming tool: ${item.name} (${item.skyblockId})`);
		}

		this.info = tool;
		this.crops = tool.crops ?? (tool.crop ? [tool.crop] : []);
		// Set the base class crop property for backwards compatibility with Upgradeable interface
		this.crop = this.crops[0];

		if (item.lore) {
			this.rarity = getRarityFromLore(item.lore);
		}

		this.counter = this.getCounter();
		this.cultivating = this.getCultivating() ?? 0;
		this.logCounter = 0;
		this.collAnalysis = 0;

		this.setReforge(item.attributes?.modifier ?? '');

		this.farmingForDummies = +(this.item.attributes?.farming_for_dummies_count ?? 0);
		this.recombobulated = this.item.attributes?.rarity_upgrades === '1';

		this.overclocks = this.getOverclocks();
		this.level = this.getToolLevel();
		this.xp = this.getXp();

		this.fortune = this.getFortune();

		if (this.reforge?.name && item.name) {
			const [prefix, name] = item.name.split(this.reforge.name);
			this.colorPrefix = prefix ?? '';
			this.itemname = name?.trim() ?? '';
		} else {
			this.colorPrefix = '';
			this.itemname = item.name ?? '';
		}
	}

	private setReforge(reforgeId: string) {
		this.reforge = REFORGES[reforgeId] ?? undefined;
		this.reforgeStats = this.reforge?.tiers?.[this.rarity];
	}

	changeReforgeTo(reforgeId: string) {
		this.setReforge(reforgeId);
		this.fortune = this.getFortune();
	}

	changeFarmedCropsTo(crops: number) {
		if (this.tool.type !== FarmingToolType.MathematicalHoe) return;

		const digits = Math.floor(crops).toString().length - 4;

		if (this.logCounter > 0) {
			this.logCounter = digits * 16;
		}

		if (this.collAnalysis > 0) {
			this.collAnalysis = digits * 8;
		}

		this.fortune = this.getFortune();
	}

	getStat(stat: Stat): number {
		if (stat === Stat.FarmingFortune) {
			return this.getFortune();
		}

		let sum = 0;

		// Tools now have a flat +1 Farming Wisdom baseline.
		if (stat === Stat.FarmingWisdom) {
			sum += 1;
		}

		// Gems
		sum += getGemStat(this.item, stat, this.rarity);

		// Reforge stats
		sum += this.reforgeStats?.stats?.[stat] ?? 0;

		// Enchantments
		const enchantments = Object.entries(this.item.enchantments ?? {});
		for (const [enchant, level] of enchantments) {
			if (!level) continue;

			const enchantment = FARMING_ENCHANTS[enchant];
			if (!enchantment || !level) continue;
			if (enchantment.cropSpecific && !this.crops.includes(enchantment.cropSpecific)) continue;

			for (const crop of this.crops) {
				sum += getStatFromEnchant(level, enchantment, stat, this.options, crop);
			}
		}

		return sum;
	}

	getFortune(): number {
		this.fortuneBreakdown = {};
		let sum = 0;

		// Tool level (4 Farming Fortune per tool level)
		const levelFortune = this.level * 4;
		this.fortuneBreakdown['Tool Level'] = levelFortune;
		sum += levelFortune;

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

		// Gems
		const peridot = getPeridotFortune(this.rarity, this.item);
		if (peridot > 0) {
			this.fortuneBreakdown['Peridot Gems'] = peridot;
			sum += peridot;
		}

		// Enchantments
		const enchantments = Object.entries(this.item.enchantments ?? {});
		for (const [enchant, level] of enchantments) {
			if (!level) continue;

			const enchantment = FARMING_ENCHANTS[enchant];
			if (!enchantment || !level) continue;
			if (enchantment.cropSpecific && !this.crops.includes(enchantment.cropSpecific)) continue;

			for (const crop of this.crops) {
				const fortune = getFortuneFromEnchant(level, enchantment, this.options, crop);
				if (fortune > 0) {
					this.fortuneBreakdown[enchantment.name] = fortune;
					sum += fortune;
				}
			}
		}

		// Axed Perk (2% bonus)
		if (this.hasAxedPerk()) {
			const axed = sum * 0.02;
			this.fortuneBreakdown['Axed Perk'] = axed;
			sum += axed;
		}

		this.fortune = sum;
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

	private getToolLevel(): number {
		const level = +(this.item?.attributes?.levelable_lvl ?? 1);
		return level && !isNaN(level) ? level : 1;
	}

	private getXp(): number {
		const xp = +(this.item?.attributes?.levelable_exp ?? 0);
		return xp && !isNaN(xp) ? xp : 0;
	}

	private getOverclocks(): number {
		const overclocks = +(this.item?.attributes?.levelable_overclocks ?? 0);
		return overclocks && !isNaN(overclocks) ? overclocks : 0;
	}

	getCultivatingLevel(): number {
		return this.item.enchantments?.cultivating ?? 0;
	}

	get farmed(): number {
		return this.counter ?? this.cultivating ?? 0;
	}

	isUsed(): boolean {
		if (this.farmed > 0) return true;
		if (this.getCultivatingLevel() > 0) return true;
		return false;
	}

	supportsCultivating(): boolean {
		return this.type ? (FARMING_ENCHANTS.cultivating?.appliesTo.includes(this.type) ?? false) : false;
	}

	isMissingDedication() {
		if (this.crops.length === 0) return false;
		return (
			this.item?.enchantments?.dedication &&
			this.crops.some((crop) => (this.options?.milestones?.[crop] ?? 0) <= 0)
		);
	}

	// Check if the tool has the Axed Perk by seeing if the stats in the lore have an additional 2% bonus
	hasAxedPerk(): boolean {
		if (this.type !== ReforgeTarget.Axe) return false;
		if (this.fortuneBreakdown['Axed Perk']) return true;

		const value = this.options?.perks?.['axed'] as string | number | undefined;
		return value === '1' || value === 1;
	}

	static isValid(item: EliteItemDto | FarmingTool): boolean {
		if (item instanceof FarmingTool) return true;
		return FARMING_TOOLS[item.skyblockId as keyof typeof FARMING_TOOLS] !== undefined;
	}

	static fromArray(items: EliteItemDto[], options?: PlayerOptions): FarmingTool[] {
		return items
			.filter((item) => FarmingTool.isValid(item))
			.map((item) => new FarmingTool(item, options))
			.sort((a, b) => b.fortune - a.fortune);
	}

	static fakeItem(info: UpgradeableInfo, options?: PlayerOptions): FarmingTool | undefined {
		const fake: EliteItemDto = {
			name: info.name,
			skyblockId: info.skyblockId,
			uuid: crypto.randomUUID(),
			lore: ['This is a fake item used for upgrade calculations!'],
			attributes: {},
			enchantments: {},
		};

		if (!FarmingTool.isValid(fake)) return undefined;

		return new FarmingTool(fake, options);
	}
}

for (const item of Object.values(FARMING_TOOLS)) {
	if (!item) continue;
	registerItem({
		info: item,
		fakeItem: (i, o) => FarmingTool.fakeItem(i, o),
	});
}
