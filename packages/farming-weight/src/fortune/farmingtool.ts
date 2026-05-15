import { CROP_INFO, type Crop } from '../constants/crops.js';
import { FARMING_ENCHANTS } from '../constants/enchants.js';
import { type Rarity, REFORGES, type Reforge, ReforgeTarget, type ReforgeTier } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import { TOOL_EXP_LEVELS } from '../constants/toollevels.js';
import {
	type FortuneSourceProgress,
	type FortuneUpgrade,
	getQueryStats,
	type StatQueryOptions,
} from '../constants/upgrades.js';
import type { Effect, EffectEnvironment } from '../effects/types.js';
import { statsToEffects } from '../items/sources/effects-util.js';
import { enchantEffects } from '../items/sources/enchants.js';
import { gemEffects } from '../items/sources/gems.js';
import { reforgeEffects } from '../items/sources/reforges.js';
import { FARMING_TOOLS, type FarmingToolInfo, FarmingToolType } from '../items/tools.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import { getSourceProgress } from '../upgrades/getsourceprogress.js';
import { TOOL_FORTUNE_SOURCES } from '../upgrades/sources/toolsources.js';
import { getSelfFortuneUpgrade, getUpgradeableRarityUpgrade } from '../upgrades/upgrades.js';
import { filterAndSortUpgrades } from '../upgrades/upgradeutils.js';
import { getFortuneFromEnchant, getStatFromEnchant } from '../util/enchants.js';
import { getLevel, type LevelingStats } from '../util/garden.js';
import { getGemStat, getPeridotFortune } from '../util/gems.js';
import { getRarityFromItem } from '../util/itemstats.js';
import type { EliteItemDto } from './item.js';
import type { UpgradeableInfo } from './upgradeable.js';
import { UpgradeableBase } from './upgradeablebase.js';

export interface ToolCurrentLevelProgress {
	/** Current displayed tool level (1-based). */
	level: number;
	/** Next level number (1-based). Present when we know the requirement. */
	next?: number;
	/** Raw XP value from the API for this level. */
	total: number;
	/** XP progress within this level (clamped to the current level goal). */
	progress: number;
	/** XP required to reach the next level from the current level. */
	goal?: number;
	/** Progress ratio within this level (0..1). */
	ratio: number;
	/**
	 * True when the tool is effectively capped (shows 100% but does not advance).
	 * This is inferred when XP meets/exceeds the current goal, or when the tool is already level 50.
	 */
	maxed: boolean;
}

export class FarmingTool extends UpgradeableBase {
	public declare item: EliteItemDto;
	public declare crops: Crop[];
	public declare info: FarmingToolInfo;

	public override get type(): ReforgeTarget {
		return ReforgeTarget.FarmingTool;
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

	/**
	 * Tool XP (`levelable_exp`) is XP within the current level and resets on level-up.
	 * When a tool is capped it can show >= 100% progress but not advance.
	 */
	getCurrentLevelProgress(): ToolCurrentLevelProgress {
		const currentLevel = Math.max(1, Math.floor(this.level || 1));
		const rawXp = this.xp || 0;

		if (currentLevel >= 50) {
			return {
				level: 50,
				next: undefined,
				total: rawXp,
				progress: 0,
				goal: undefined,
				ratio: 1,
				maxed: true,
			};
		}

		const goal = (TOOL_EXP_LEVELS as unknown as number[])[currentLevel - 1] ?? 0;
		if (!goal) {
			return {
				level: currentLevel,
				next: undefined,
				total: rawXp,
				progress: Math.max(0, rawXp),
				goal: undefined,
				ratio: 0,
				maxed: false,
			};
		}

		const clamped = Math.max(0, Math.min(rawXp, goal));
		const stats: LevelingStats = getLevel(clamped, [goal], 1, false);
		const cappedAtThisLevel = rawXp >= goal;

		return {
			level: currentLevel,
			next: currentLevel + 1,
			total: rawXp,
			progress: stats.progress,
			goal,
			ratio: cappedAtThisLevel ? 1 : stats.ratio,
			maxed: cappedAtThisLevel,
		};
	}

	public declare options?: PlayerOptions;

	constructor(item: EliteItemDto, options?: PlayerOptions) {
		super({ item, options, items: FARMING_TOOLS });
		this.rebuildTool(item, options);
	}

	getProgress(stats?: Stat[], zeroed = false): FortuneSourceProgress[] {
		return getSourceProgress<FarmingTool>(this, TOOL_FORTUNE_SOURCES, zeroed, stats);
	}

	getUpgrades(options?: StatQueryOptions): FortuneUpgrade[] {
		const { deadEnd, upgrade: self } = getSelfFortuneUpgrade(this) ?? {};
		if (deadEnd && self) return filterAndSortUpgrades([self], options);

		const stats = getQueryStats(options, [Stat.FarmingFortune, Stat.Overbloom]);

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

		this.rarity = getRarityFromItem(item, this.rarity);

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

	getStat(stat: Stat, selectedCrop?: Crop): number {
		let sum = 0;
		const crops = selectedCrop && this.crops.includes(selectedCrop) ? [selectedCrop] : this.crops;

		// Tool level gives 4 crop-specific fortune per level
		for (const crop of crops) {
			if (stat === CROP_INFO[crop]?.fortuneType) {
				sum += this.level * 4;
				break;
			}
		}

		if (stat === Stat.FarmingFortune) {
			sum += this.farmingForDummies;
		}

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

			for (const crop of crops) {
				const val = getStatFromEnchant(level, enchantment, stat, this.options, crop);

				sum += val;
			}
		}

		return sum;
	}

	/**
	 * Returns the declarative `Effect[]` representation of every contribution
	 * this tool makes. Tool-level fortune (per-crop), Farming for Dummies,
	 * baseline Farming Wisdom, gems, reforge, enchants. The tool-level fortune
	 * uses the tool's own `crops` list to emit one `add-stat` per crop fortune
	 * type. The resolver applies these unconditionally; the calculator picks
	 * the appropriate per-crop fortune based on the active crop.
	 */
	getEffects(env: EffectEnvironment): Effect[] {
		const sourceName = this.item.name ?? this.info.name;
		const effects: Effect[] = [];

		const levelStats: Partial<Record<Stat, number>> = {};
		for (const crop of this.crops) {
			const cropStat = CROP_INFO[crop]?.fortuneType;
			if (!cropStat) continue;
			levelStats[cropStat] = (levelStats[cropStat] ?? 0) + this.level * 4;
		}
		effects.push(...statsToEffects(levelStats, `${sourceName} (Tool Level)`));

		if (this.farmingForDummies > 0) {
			effects.push({
				source: `${sourceName} (Farming for Dummies)`,
				op: 'add-stat',
				stat: Stat.FarmingFortune,
				value: this.farmingForDummies,
			});
		}

		effects.push({
			source: sourceName,
			op: 'add-stat',
			stat: Stat.FarmingWisdom,
			value: 1,
		});

		effects.push(...gemEffects(this.item, this.rarity, `${sourceName} (Gems)`));

		if (this.reforge && this.item.attributes?.modifier) {
			effects.push(
				...reforgeEffects(this.item.attributes.modifier, this.rarity, `${sourceName} (${this.reforge.name})`)
			);
		}

		for (const [enchantId, level] of Object.entries(this.item.enchantments ?? {})) {
			if (!level) continue;
			const enchantment = FARMING_ENCHANTS[enchantId];
			if (enchantment?.cropSpecific && !this.crops.includes(enchantment.cropSpecific)) continue;
			effects.push(...enchantEffects(enchantId, level, env, this.options ?? {}));
		}

		return effects;
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
				let fortune = getFortuneFromEnchant(level, enchantment, this.options, crop);
				const cropStat = CROP_INFO[crop]?.fortuneType;

				if (cropStat) {
					fortune += getStatFromEnchant(level, enchantment, cropStat, this.options, crop);
				}

				if (fortune > 0) {
					this.fortuneBreakdown[enchantment.name] = fortune;
					sum += fortune;
				}
			}
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
