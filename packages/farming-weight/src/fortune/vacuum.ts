import { FARMING_ATTRIBUTE_SHARDS, getAttributeAmount, getShardLevel } from '../constants/attributes.js';
import { FARMING_ENCHANTS } from '../constants/enchants.js';
import { Rarity, REFORGES, type Reforge, ReforgeTarget, type ReforgeTier } from '../constants/reforges.js';
import { Stat, type StatBreakdown } from '../constants/stats.js';
import {
	type FortuneSourceProgress,
	type FortuneUpgrade,
	getQueryStats,
	type StatQueryOptions,
	type UpgradeTreeNode,
} from '../constants/upgrades.js';
import { buildEffectEnvironmentFromOptions } from '../effects/environment.js';
import { resolveStatBreakdown } from '../effects/resolver.js';
import type { Effect } from '../effects/types.js';
import { statsToEffects } from '../items/sources/effects-util.js';
import { enchantEffects } from '../items/sources/enchants.js';
import { gemEffects } from '../items/sources/gems.js';
import { reforgeEffects } from '../items/sources/reforges.js';
import { VACUUMS, type VacuumInfo } from '../items/vacuums.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import { getSourceProgress } from '../upgrades/getsourceprogress.js';
import { VACUUM_FORTUNE_SOURCES } from '../upgrades/sources/vacuumsources.js';
import { getSelfFortuneUpgrade, getUpgradeableRarityUpgrade } from '../upgrades/upgrades.js';
import { filterAndSortUpgrades } from '../upgrades/upgradeutils.js';
import { getStatFromEnchant } from '../util/enchants.js';
import { getGemStat, getPeridotFortune } from '../util/gems.js';
import { getRarityFromItem, nextRarity } from '../util/itemstats.js';
import type { EliteItemDto } from './item.js';
import type { UpgradeableInfo } from './upgradeable.js';
import { UpgradeableBase } from './upgradeablebase.js';

const DEFAULT_VACUUM_STATS = [Stat.PestKillFortune, Stat.Damage, Stat.FarmingFortune];
const INSECT_POWER_DAMAGE_PER_LEVEL = 0.1;

export class Vacuum extends UpgradeableBase {
	public declare item: EliteItemDto;
	public declare info: VacuumInfo;

	public override get type(): ReforgeTarget {
		return ReforgeTarget.Vacuum;
	}

	public declare itemname: string;
	private declare colorPrefix: string;
	public get name() {
		return this.colorPrefix + (this.reforge?.name ?? '') + ' ' + this.itemname;
	}

	public declare rarity: Rarity;
	public declare reforge: Reforge | undefined;
	public declare reforgeStats: ReforgeTier | undefined;
	public declare farmingForDummies: number;
	public declare bookwormBooks: number;
	public declare recombobulated: boolean;
	public declare fortune: number;
	public declare fortuneBreakdown: Record<string, number>;
	public declare options?: PlayerOptions;

	constructor(item: EliteItemDto, options?: PlayerOptions) {
		super({ item, options, items: VACUUMS });
		this.rebuildVacuum(item, options);
	}

	getProgress(stats?: Stat[], zeroed = false): FortuneSourceProgress[] {
		return getSourceProgress<Vacuum>(this, VACUUM_FORTUNE_SOURCES, zeroed, stats);
	}

	getUpgrades(options?: StatQueryOptions): FortuneUpgrade[] {
		const { deadEnd, upgrade: self } = getSelfFortuneUpgrade(this) ?? {};
		if (deadEnd && self) return filterAndSortUpgrades([self], options);

		const stats = getQueryStats(options, DEFAULT_VACUUM_STATS);
		const upgrades = getSourceProgress<Vacuum>(this, VACUUM_FORTUNE_SOURCES, false, stats).flatMap(
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

	rebuildVacuum(item: EliteItemDto, options?: PlayerOptions) {
		this.options = options;
		this.item = item;

		const vacuum = VACUUMS[item.skyblockId as keyof typeof VACUUMS];
		if (!vacuum) {
			throw new Error(`Unknown vacuum: ${item.name} (${item.skyblockId})`);
		}

		this.info = vacuum;
		this.crop = undefined;
		this.rarity = getRarityFromItem(item, this.rarity);
		this.setReforge(item.attributes?.modifier ?? '');
		this.farmingForDummies = +(this.item.attributes?.farming_for_dummies_count ?? 0);
		this.bookwormBooks = +(this.item.attributes?.bookworm_books ?? 0);
		this.recombobulated = this.item.attributes?.rarity_upgrades === '1';
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

	changeReforgeTo(reforgeId: string) {
		this.setReforge(reforgeId);
		this.fortune = this.getFortune();
	}

	getStat(stat: Stat): number {
		if (stat === Stat.Damage) {
			return this.getDamageWithInsectPowerLevel(this.getInsectPowerDamageLevel());
		}

		let sum = 0;
		sum += this.info.baseStats?.[stat] ?? 0;

		if (stat === Stat.FarmingFortune) {
			sum += this.farmingForDummies;
		}

		sum += getGemStat(this.item, stat, this.rarity);
		sum += this.reforgeStats?.stats?.[stat] ?? 0;

		for (const [enchant, level] of Object.entries(this.item.enchantments ?? {})) {
			if (!level) continue;
			const enchantment = FARMING_ENCHANTS[enchant];
			if (!enchantment) continue;
			sum += getStatFromEnchant(level, enchantment, stat, this.options);
		}

		return sum;
	}

	getStatBreakdown(stat: Stat): StatBreakdown {
		const env = buildEffectEnvironmentFromOptions(this.options);
		return Object.fromEntries(
			Object.entries(resolveStatBreakdown(this.getEffects(), stat, { env })).map(([source, value]) => [
				source,
				{ value, stat },
			])
		);
	}

	getEffects(): Effect[] {
		const sourceName = this.item.name ?? this.info.name;
		const env = buildEffectEnvironmentFromOptions(this.options);
		const effects: Effect[] = [];

		effects.push(...statsToEffects(this.info.baseStats, sourceName));

		if (this.farmingForDummies > 0) {
			effects.push({
				source: `${sourceName} (Farming for Dummies)`,
				op: 'add-stat',
				stat: Stat.FarmingFortune,
				value: this.farmingForDummies,
			});
		}

		if (this.bookwormBooks > 0) {
			effects.push({
				source: `${sourceName} (Bookworm's Favorite Book)`,
				op: 'add-stat',
				stat: Stat.Damage,
				value: this.bookwormBooks * 10,
			});
		}

		effects.push(...gemEffects(this.item, this.rarity, `${sourceName} (Gems)`));

		if (this.reforge && this.item.attributes?.modifier) {
			effects.push(
				...reforgeEffects(this.item.attributes.modifier, this.rarity, `${sourceName} (${this.reforge.name})`)
			);
		}

		for (const [enchantId, level] of Object.entries(this.item.enchantments ?? {})) {
			if (!level) continue;
			effects.push(...enchantEffects(enchantId, level, env, this.options ?? {}));
		}

		const insectPowerBonus = this.getInsectPowerAdditiveDamageBonus();
		if (insectPowerBonus > 0) {
			const level = this.getInsectPowerDamageLevel();
			effects.push({
				source: FARMING_ATTRIBUTE_SHARDS.insect_power?.name ?? 'Praying Mantis Shard',
				op: 'add-stat',
				stat: Stat.Damage,
				value: insectPowerBonus,
				meta: {
					description: `+${level * 10}% vacuum damage`,
				},
			});
		}

		if (this.reforge?.name === 'Buzzing') {
			const damageBonus = this.getDamageBeforeBuzzing();
			if (damageBonus > 0) {
				effects.push({
					source: `${sourceName} (Buzzing Bonus)`,
					op: 'add-stat',
					stat: Stat.Damage,
					value: damageBonus,
				});
			}
		}

		return effects;
	}

	getFortune(): number {
		this.fortuneBreakdown = {};
		let sum = 0;

		const add = (source: string, value: number) => {
			if (value <= 0) return;
			this.fortuneBreakdown[source] = value;
			sum += value;
		};

		add('Base Stats', this.info.baseStats?.[Stat.FarmingFortune] ?? 0);
		add('Farming for Dummies', this.farmingForDummies);
		add(this.reforge?.name ?? 'Reforge', this.reforgeStats?.stats?.[Stat.FarmingFortune] ?? 0);
		add('Peridot Gems', getPeridotFortune(this.rarity, this.item));

		for (const [enchant, level] of Object.entries(this.item.enchantments ?? {})) {
			if (!level) continue;
			const enchantment = FARMING_ENCHANTS[enchant];
			if (!enchantment) continue;
			add(enchantment.name, getStatFromEnchant(level, enchantment, Stat.FarmingFortune, this.options));
		}

		this.fortune = sum;
		return sum;
	}

	clone(): Vacuum {
		return new Vacuum(
			{
				...this.item,
				enchantments: { ...this.item.enchantments },
				attributes: { ...this.item.attributes },
				gems: { ...this.item.gems },
				lore: [...(this.item.lore ?? [])],
			},
			this.options
		);
	}

	applyUpgrade(upgrade: FortuneUpgrade): void {
		if (!upgrade.meta) return;
		const { type, key, value, id } = upgrade.meta;

		if (type === 'enchant' && key) {
			this.item.enchantments ??= {};
			this.item.enchantments[key] = Number(value);
		} else if (type === 'reforge' && id) {
			this.item.attributes ??= {};
			this.item.attributes.modifier = id;
		} else if (type === 'item' && id === 'farming_for_dummies_count') {
			this.item.attributes ??= {};
			this.item.attributes.farming_for_dummies_count = String(value);
		} else if (type === 'item' && id === 'bookworm_books') {
			this.item.attributes ??= {};
			this.item.attributes.bookworm_books = String(value);
		} else if (type === 'item' && id === 'rarity_upgrades' && value) {
			this.item.attributes ??= {};
			this.item.attributes.rarity_upgrades = String(value);
			this.item.attributes.rarity = nextRarity(this.rarity);
		} else if (type === 'attribute' && key && value !== undefined) {
			this.options = {
				...this.options,
				attributes: {
					...this.options?.attributes,
					[key]: Number(value),
				},
			};
		} else if (type === 'gem' && upgrade.meta.slot && value) {
			this.item.gems ??= {};
			this.item.gems[upgrade.meta.slot] = String(value);
		} else if (type === 'buy_item' && id) {
			const info = VACUUMS[id];
			if (!info) return;
			const upgraded = Vacuum.fakeItem(info, this.options);
			if (!upgraded) return;
			upgraded.item.uuid = this.item.uuid;
			upgraded.item.enchantments = { ...upgraded.item.enchantments, ...this.item.enchantments };
			upgraded.item.attributes = { ...upgraded.item.attributes, ...this.item.attributes };
			upgraded.item.gems = { ...this.item.gems };
			this.rebuildVacuum(upgraded.item, this.options);
			return;
		}

		this.rebuildVacuum(this.item, this.options);
	}

	expandUpgrade(
		upgrade: FortuneUpgrade,
		options?: { maxDepth?: number; stats?: Stat[]; includeAllTierUpgradeChildren?: boolean }
	): UpgradeTreeNode {
		const { maxDepth = 10, stats = DEFAULT_VACUUM_STATS, includeAllTierUpgradeChildren = false } = options ?? {};
		return this.buildUpgradeTree(upgrade, 0, maxDepth, stats, includeAllTierUpgradeChildren, new Set(), new Set());
	}

	private buildUpgradeTree(
		upgrade: FortuneUpgrade,
		depth: number,
		maxDepth: number,
		stats: Stat[],
		includeAllTierUpgradeChildren: boolean,
		visited: Set<string>,
		usedConflictKeys: Set<string>
	): UpgradeTreeNode {
		const upgradeKey = this.getUpgradeKey(upgrade);
		const statsBefore = this.getAllStats(stats);

		if (visited.has(upgradeKey)) {
			return {
				upgrade,
				statsBefore,
				statsAfter: statsBefore,
				statsGained: {},
				totalCost: upgrade.cost,
				children: [],
			};
		}
		visited.add(upgradeKey);

		const upgraded = this.clone();
		upgraded.applyUpgrade(upgrade);
		const statsAfter = upgraded.getAllStats(stats);
		const node: UpgradeTreeNode = {
			upgrade,
			statsBefore,
			statsAfter,
			statsGained: Vacuum.computeStatsDiff(statsBefore, statsAfter),
			totalCost: upgrade.cost,
			children: [],
		};

		if (depth >= maxDepth) return node;

		const childConflictKeys = new Set(usedConflictKeys);
		if (upgrade.conflictKey) childConflictKeys.add(upgrade.conflictKey);

		if (
			!(includeAllTierUpgradeChildren && depth === 0) &&
			upgrade.meta?.type === 'buy_item' &&
			upgrade.meta.itemUuid
		) {
			for (const originalUpgrade of this.getUpgrades({ stats })) {
				if (originalUpgrade.conflictKey) childConflictKeys.add(originalUpgrade.conflictKey);
			}
		}

		for (const followUp of upgraded.getFollowUpUpgrades(upgrade, stats[0] ?? Stat.PestKillFortune)) {
			if (followUp.conflictKey && childConflictKeys.has(followUp.conflictKey)) continue;
			node.children.push(
				upgraded.buildUpgradeTree(
					followUp,
					depth + 1,
					maxDepth,
					stats,
					includeAllTierUpgradeChildren,
					new Set(visited),
					childConflictKeys
				)
			);
		}

		const primaryStat = stats[0] ?? Stat.PestKillFortune;
		node.children.sort((a, b) => (b.statsGained[primaryStat] ?? 0) - (a.statsGained[primaryStat] ?? 0));
		return node;
	}

	private getFollowUpUpgrades(appliedUpgrade: FortuneUpgrade, primaryStat: Stat): FortuneUpgrade[] {
		const meta = appliedUpgrade.meta;
		if (!meta) return [];

		return this.getUpgrades({ stat: primaryStat }).filter((upgrade) => {
			if (meta.type === 'gem') return upgrade.meta?.type === meta.type && upgrade.meta?.slot === meta.slot;
			if (meta.type === 'item') return upgrade.meta?.type === meta.type && upgrade.meta?.id === meta.id;
			if (meta.type === 'buy_item') return upgrade.meta?.type === meta.type;
			return upgrade.meta?.type === meta.type && upgrade.meta?.key === meta.key;
		});
	}

	private getAllStats(stats: Stat[]): Partial<Record<Stat, number>> {
		const result: Partial<Record<Stat, number>> = {};
		for (const stat of stats) {
			const value = this.getStat(stat);
			if (value !== 0) result[stat] = value;
		}
		return result;
	}

	getInsectPowerDamageLevel(): number {
		return getShardLevel(Rarity.Uncommon, getAttributeAmount(this.options?.attributes, 'insect_power'));
	}

	getInsectPowerDamageMultiplier(level = this.getInsectPowerDamageLevel()): number {
		return 1 + Math.max(0, level) * INSECT_POWER_DAMAGE_PER_LEVEL;
	}

	getDamageWithInsectPowerLevel(level: number): number {
		let damage = this.getDamageBeforeInsectPower() + this.getInsectPowerAdditiveDamageBonus(level);
		if (this.reforge?.name === 'Buzzing') damage *= 2;
		return damage;
	}

	getInsectPowerDamageBonus(level = this.getInsectPowerDamageLevel()): number {
		return this.getDamageWithInsectPowerLevel(level) - this.getDamageWithInsectPowerLevel(0);
	}

	private getInsectPowerAdditiveDamageBonus(level = this.getInsectPowerDamageLevel()): number {
		return (this.getDamageBeforeInsectPower() * Math.max(0, level)) / 10;
	}

	private getDamageBeforeBuzzing(): number {
		return this.getDamageBeforeInsectPower() * this.getInsectPowerDamageMultiplier();
	}

	private getDamageBeforeInsectPower(): number {
		let sum = 0;

		sum += this.info.baseStats?.[Stat.Damage] ?? 0;
		sum += this.bookwormBooks * 10;
		sum += getGemStat(this.item, Stat.Damage, this.rarity);
		sum += this.reforgeStats?.stats?.[Stat.Damage] ?? 0;

		for (const [enchant, level] of Object.entries(this.item.enchantments ?? {})) {
			if (!level) continue;
			const enchantment = FARMING_ENCHANTS[enchant];
			if (!enchantment) continue;
			sum += getStatFromEnchant(level, enchantment, Stat.Damage, this.options);
		}

		return sum;
	}

	private getUpgradeKey(upgrade: FortuneUpgrade): string {
		const meta = upgrade.meta;
		if (!meta) return upgrade.title;
		return [
			meta.type ?? '',
			meta.id ?? '',
			meta.itemUuid ?? '',
			meta.key ?? '',
			meta.slot ?? '',
			String(meta.value ?? ''),
		].join(':');
	}

	private static computeStatsDiff(
		before: Partial<Record<Stat, number>>,
		after: Partial<Record<Stat, number>>
	): Partial<Record<Stat, number>> {
		const result: Partial<Record<Stat, number>> = {};
		const allStats = new Set([...Object.keys(before), ...Object.keys(after)]) as Set<Stat>;
		for (const stat of allStats) {
			const diff = (after[stat] ?? 0) - (before[stat] ?? 0);
			if (diff !== 0) result[stat] = diff;
		}
		return result;
	}

	private setReforge(reforgeId: string) {
		const reforge = REFORGES[reforgeId] ?? undefined;
		this.reforge = reforge?.appliesTo.includes(this.type) ? reforge : undefined;
		this.reforgeStats = this.reforge?.tiers?.[this.rarity];
	}

	static isValid(item: EliteItemDto | Vacuum): boolean {
		if (item instanceof Vacuum) return true;
		return VACUUMS[item.skyblockId as keyof typeof VACUUMS] !== undefined;
	}

	static fromArray(items: EliteItemDto[], options?: PlayerOptions): Vacuum[] {
		return items
			.filter((item) => Vacuum.isValid(item))
			.map((item) => new Vacuum(item, options))
			.sort((a, b) => b.fortune - a.fortune);
	}

	static fakeItem(info: UpgradeableInfo, options?: PlayerOptions): Vacuum | undefined {
		const fake: EliteItemDto = {
			name: info.name,
			skyblockId: info.skyblockId,
			uuid: crypto.randomUUID(),
			lore: ['This is a fake item used for upgrade calculations!'],
			attributes: {},
			enchantments: {},
		};

		if (!Vacuum.isValid(fake)) return undefined;

		return new Vacuum(fake, options);
	}
}
