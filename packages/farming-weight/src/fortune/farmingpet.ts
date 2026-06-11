import {
	getChipInputLevel,
	getChipInputRarity,
	getChipLevel,
	getChipTempMultiplierPerLevel,
} from '../constants/chips.js';
import type { LateCalculationContext, LateCalculationResult } from '../constants/latecalc.js';
import { RARITY_COLORS, Rarity } from '../constants/reforges.js';
import { getStatValue, Stat, type StatBreakdown } from '../constants/stats.js';
import {
	type FortuneSourceProgress,
	type FortuneUpgrade,
	getQueryStats,
	includesFortuneSourceType,
	type StatQueryOptions,
	UpgradeAction,
	UpgradeCategory,
} from '../constants/upgrades.js';
import type { Effect, EffectEnvironment } from '../effects/types.js';
import {
	FARMING_PET_ITEMS,
	FARMING_PETS,
	type FarmingPetAbility,
	type FarmingPetInfo,
	type FarmingPetItemInfo,
	FarmingPetStatType,
	type FarmingPets,
	type FarmingPetType,
	PET_LEVELS,
	PET_RARITY_OFFSETS,
} from '../items/pets.js';
import { statsToEffects } from '../items/sources/effects-util.js';
import type { FarmingPlayer } from '../player/player.js';
import type { PlayerOptions } from '../player/playeroptions.js';
import { getRarityFromLore } from '../util/itemstats.js';
import type { EliteItemDto } from './item.js';

export function createFarmingPet(pet: FarmingPetType) {
	return new FarmingPet(pet);
}

function getPetItemId(item: FarmingPetItemInfo): string | undefined {
	return Object.entries(FARMING_PET_ITEMS).find(([, value]) => value === item)?.[0];
}

function improvesRequestedStat(upgrade: FortuneUpgrade, stats: readonly Stat[]): boolean {
	return stats.some((stat) => (upgrade.stats?.[stat] ?? 0) > 0);
}

type ComputedPetAbilityStats = ReturnType<FarmingPetAbility['computed']>;

export class FarmingPet {
	public declare readonly pet: FarmingPetType;
	public declare readonly type: FarmingPets;
	public declare readonly info: FarmingPetInfo;
	public declare readonly rarity: Rarity;
	public declare readonly level: number;
	public declare readonly item: FarmingPetItemInfo | undefined;

	public declare fortune: number;
	public declare breakdown: Record<string, number>;

	public declare options?: PlayerOptions;

	constructor(pet: FarmingPetType, options?: PlayerOptions) {
		this.options = options;
		this.pet = pet;

		if (!this.pet.uuid) {
			// Generate a UUID for the pet
			this.pet.uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		}

		this.info = FARMING_PETS[pet.type as keyof typeof FARMING_PETS];
		if (!this.info) {
			throw new Error(`Invalid farming pet type: ${pet.type}`);
		}

		this.type = pet.type as FarmingPets;

		this.rarity = getRarityFromLore([pet.tier ?? '']) ?? Rarity.Common;
		this.level = this.getLevel();

		this.item = pet.heldItem ? FARMING_PET_ITEMS[pet.heldItem as keyof typeof FARMING_PET_ITEMS] : undefined;

		this.fortune = this.getFortune();
	}

	setOptions(options: PlayerOptions) {
		this.options = options;
		this.fortune = this.getFortune();
	}

	private computeFortune(
		stat: Stat = Stat.FarmingFortune,
		player?: FarmingPlayer,
		abilityStatsCache?: Map<FarmingPetAbility, ComputedPetAbilityStats>
	): { fortune: number; breakdown: Record<string, number> } {
		let fortune = 0;
		const breakdown: Record<string, number> = {};
		const typedContributions: Partial<Record<FarmingPetStatType, number>> = {};

		const addContribution = (name: string, value: number, type?: FarmingPetStatType) => {
			if (!value) return;
			fortune += value;
			breakdown[name] = (breakdown[name] ?? 0) + value;
			if (type) typedContributions[type] = (typedContributions[type] ?? 0) + value;
		};

		// Base stats
		const baseStat = this.info.stats?.[stat];
		const stats = getStatValue(baseStat, this);
		if (stats) {
			addContribution(baseStat?.name ?? 'Base Stats', stats, baseStat?.type);
		}

		// Per level stats
		const perLevelStats = this.info.perLevelStats?.[stat];
		if (perLevelStats) {
			const amount = getStatValue(perLevelStats, this) * this.level;
			addContribution(perLevelStats.name ?? 'Unknown', amount, perLevelStats.type);
		}

		// Per rarity fortune stats
		const perRarityStats = this.info.perRarityLevelStats?.[this.rarity]?.[stat];
		if (perRarityStats) {
			const amount = getStatValue(perRarityStats, this) * this.level;
			addContribution(perRarityStats.name ?? 'Rarity Stat', amount, perRarityStats.type);
		}

		// Pet abilities
		if (this.info.abilities) {
			const hyperLevel = getChipLevel(getChipInputLevel(this.options?.chips, 'hypercharge'));
			const perLevel = getChipTempMultiplierPerLevel(
				'hypercharge',
				hyperLevel,
				getChipInputRarity(this.options?.chipRarities, 'hypercharge')
			);
			const hyperchargeMultiplier = 1 + perLevel * hyperLevel;
			const abilityContext = { player, options: this.options ?? {} };

			for (const ability of this.info.abilities) {
				if (ability.exists && !ability.exists(abilityContext, this)) {
					continue;
				}

				let stats = abilityStatsCache?.get(ability);
				if (!stats) {
					stats = ability.computed(abilityContext, this);
					abilityStatsCache?.set(ability, stats);
				}
				const fortuneStat = stats[stat];

				let value = getStatValue(fortuneStat, this.options);
				if (!value || !fortuneStat) continue;

				if (ability.temporary) {
					value *= hyperchargeMultiplier;
				}

				addContribution(fortuneStat.name ?? ability.name, value, fortuneStat.type);
			}
		}

		// Pet item modifiers such as Minos/Hephaestus Relic.
		for (const modifier of this.item?.modifiers ?? []) {
			if (modifier.kind !== 'multiply-pet-stats') continue;
			const statTypes = modifier.statTypes ?? Object.values(FarmingPetStatType);
			const affected = statTypes.reduce((sum, type) => sum + (typedContributions[type] ?? 0), 0);
			const value = affected * (modifier.multiplier - 1);
			if (value) {
				breakdown[modifier.name ?? this.item?.name ?? 'Pet Item Modifier'] =
					(breakdown[modifier.name ?? this.item?.name ?? 'Pet Item Modifier'] ?? 0) + value;
				fortune += value;
			}
		}

		// Pet item stats
		if (this.item) {
			const fortuneStat = this.item.stats?.[stat];

			const value = getStatValue(fortuneStat, this.options);
			if (value && fortuneStat) {
				fortune += value;
				breakdown[this.item.name] = value;
			}
		}

		return { fortune, breakdown };
	}

	getFortune(stat = Stat.FarmingFortune, player?: FarmingPlayer): number {
		const { fortune, breakdown } = this.computeFortune(stat, player);
		if (stat === Stat.FarmingFortune) {
			this.breakdown = breakdown;
			this.fortune = fortune;
		}
		return fortune;
	}

	/**
	 * Returns the declarative `Effect[]` representation of every per-stat
	 * contribution this pet makes (base, per-level, per-rarity-level, abilities,
	 * pet item)
	 */
	getEffects(_env: EffectEnvironment, player?: FarmingPlayer): Effect[] {
		const sourceName = this.info.name ?? this.type;
		const stats: Partial<Record<Stat, number>> = {};
		const abilityStatsCache = new Map<FarmingPetAbility, ComputedPetAbilityStats>();

		for (const stat of Object.values(Stat)) {
			const { fortune } = this.computeFortune(stat, player, abilityStatsCache);
			if (fortune) stats[stat] = fortune;
		}

		return statsToEffects(stats, sourceName);
	}

	getFullBreakdown(player?: FarmingPlayer): StatBreakdown {
		const full: StatBreakdown = {};
		let baseFortune = 0;
		const abilityStatsCache = new Map<FarmingPetAbility, ComputedPetAbilityStats>();

		for (const stat of Object.values(Stat)) {
			const { fortune, breakdown } = this.computeFortune(stat, player, abilityStatsCache);
			if (!fortune) continue;

			// Track base farming fortune for late context
			if (stat === Stat.FarmingFortune) {
				baseFortune = fortune;
			}

			for (const [name, value] of Object.entries(breakdown)) {
				if (value === 0) continue;
				const existing = full[name];
				if (existing && existing.stat === stat) {
					existing.value += value;
				} else {
					full[name] = { value, stat };
				}
			}
		}

		// Include late-phase stats when player is available
		// Use player's baseFortune for late calcs that depend on total fortune (e.g., Trample)
		if (player) {
			const lateContext: LateCalculationContext = {
				player,
				baseFortune: player.baseFortune ?? baseFortune,
				stat: Stat.FarmingFortune,
			};

			const lateResult = this.getLateStats(lateContext);
			if (lateResult.breakdown) {
				for (const [name, entry] of Object.entries(lateResult.breakdown)) {
					full[name] = entry;
				}
			}
		}

		return full;
	}

	/**
	 * Get late-phase stats for abilities that depend on total fortune.
	 * Called after all base stats have been computed.
	 */
	getLateStats(ctx: LateCalculationContext): LateCalculationResult {
		const result: LateCalculationResult = {};

		if (!this.info.abilities) {
			return result;
		}

		for (const ability of this.info.abilities) {
			if (!ability.lateComputed) continue;

			// Check if ability exists for this pet
			if (ability.exists) {
				const player = ctx.player as FarmingPlayer | undefined;
				if (!ability.exists({ player, options: this.options ?? {} }, this)) {
					continue;
				}
			}

			const lateResult = ability.lateComputed(ctx, this);

			// Merge additive values
			if (lateResult.additive !== undefined) {
				result.additive = (result.additive ?? 0) + lateResult.additive;
			}

			// Combine multipliers (multiplicative stacking)
			if (lateResult.multiplier !== undefined) {
				result.multiplier = (result.multiplier ?? 1) * lateResult.multiplier;
			}

			// Merge breakdown entries
			if (lateResult.breakdown) {
				result.breakdown = { ...result.breakdown, ...lateResult.breakdown };
			}
		}

		return result;
	}

	getFormattedName() {
		return '[' + this.level + '] ' + RARITY_COLORS[this.rarity] + this.info.name;
	}

	getLevel() {
		const offset = PET_RARITY_OFFSETS[this.rarity] ?? 0;
		const maxLevel = this.info.maxLevel ?? 100;
		let xp = this.pet.exp ?? 0;

		for (let i = offset; i < Math.min(PET_LEVELS.length, maxLevel + offset); i++) {
			const level = PET_LEVELS[i];
			if (level === undefined) break;

			if (xp < level) {
				return i + 1 - offset;
			}

			xp -= level;
		}

		return maxLevel;
	}

	getXpForLevel(level: number): number {
		const offset = PET_RARITY_OFFSETS[this.rarity] ?? 0;
		const maxLevel = this.info.maxLevel ?? 100;
		const targetLevel = Math.max(1, Math.min(level, maxLevel));
		let xp = 0;

		for (let i = offset; i < offset + targetLevel - 1; i++) {
			xp += PET_LEVELS[i] ?? 0;
		}

		return xp;
	}

	private withChanges(changes: Partial<FarmingPetType>): FarmingPet {
		return new FarmingPet({ ...this.pet, ...changes }, this.options);
	}

	private getStatTotals(
		stats: readonly Stat[],
		player?: FarmingPlayer,
		abilityStatsCache?: Map<FarmingPetAbility, ComputedPetAbilityStats>
	): Partial<Record<Stat, number>> {
		const totals: Partial<Record<Stat, number>> = {};
		for (const stat of stats) {
			const value = this.computeFortune(stat, player, abilityStatsCache).fortune;
			if (value !== 0) totals[stat] = value;
		}
		return totals;
	}

	private getBreakdownProgress(
		maxPet: FarmingPet,
		stats: readonly Stat[],
		player?: FarmingPlayer
	): FortuneSourceProgress[] {
		const progress = new Map<string, FortuneSourceProgress>();
		const currentAbilityStatsCache = new Map<FarmingPetAbility, ComputedPetAbilityStats>();
		const maxAbilityStatsCache = new Map<FarmingPetAbility, ComputedPetAbilityStats>();

		for (const stat of stats) {
			const currentBreakdown = this.computeFortune(stat, player, currentAbilityStatsCache).breakdown;
			const maxBreakdown = maxPet.computeFortune(stat, player, maxAbilityStatsCache).breakdown;
			const sourceNames = new Set([...Object.keys(currentBreakdown), ...Object.keys(maxBreakdown)]);

			for (const name of sourceNames) {
				const current = currentBreakdown[name] ?? 0;
				const max = Math.max(maxBreakdown[name] ?? 0, current);
				if (current === 0 && max === 0) continue;

				const entry =
					progress.get(name) ??
					({
						name,
						current: 0,
						max: 0,
						ratio: 0,
						stats: {},
					} satisfies FortuneSourceProgress);

				entry.stats ??= {};
				entry.stats[stat] = {
					current,
					max,
					ratio: Math.min(max === 0 ? 0 : current / max, 1),
				};

				if (stat === Stat.FarmingFortune || entry.current === 0) {
					entry.current = current;
					entry.max = max;
					entry.ratio = Math.min(max === 0 ? 0 : current / max, 1);
				}

				progress.set(name, entry);
			}
		}

		return [...progress.values()].sort((a, b) => (b.current ?? 0) - (a.current ?? 0));
	}

	private getDeltaStats(next: FarmingPet, player: FarmingPlayer | undefined): Partial<Record<Stat, number>> {
		const deltaStats: Partial<Record<Stat, number>> = {};
		const currentAbilityStatsCache = new Map<FarmingPetAbility, ComputedPetAbilityStats>();
		const nextAbilityStatsCache = new Map<FarmingPetAbility, ComputedPetAbilityStats>();
		for (const stat of Object.values(Stat)) {
			const delta =
				next.computeFortune(stat, player, nextAbilityStatsCache).fortune -
				this.computeFortune(stat, player, currentAbilityStatsCache).fortune;
			if (delta !== 0) deltaStats[stat] = +delta.toFixed(4);
		}
		return deltaStats;
	}

	private getProgressItem(): EliteItemDto {
		return {
			id: 0,
			count: 1,
			skyblockId: this.type,
			uuid: this.pet.uuid,
			name: this.getFormattedName(),
			lore: [],
			attributes: {
				pet: 'true',
				rarity: this.rarity,
			},
		};
	}

	getProgress(stats?: Stat[], player?: FarmingPlayer): FortuneSourceProgress[] {
		const queryStats = stats && stats.length > 0 ? stats : [Stat.FarmingFortune];
		const currentAbilityStatsCache = new Map<FarmingPetAbility, ComputedPetAbilityStats>();
		const currentStats = this.getStatTotals(queryStats, player, currentAbilityStatsCache);
		const maxPet = this.withChanges({ exp: this.getXpForLevel(this.info.maxLevel ?? 100) });
		const maxStats = maxPet.getStatTotals(
			queryStats,
			player,
			new Map<FarmingPetAbility, ComputedPetAbilityStats>()
		);

		const perStat: NonNullable<FortuneSourceProgress['stats']> = {};
		for (const stat of queryStats) {
			const current = currentStats[stat] ?? 0;
			const max = Math.max(maxStats[stat] ?? 0, current);
			if (current === 0 && max === 0) continue;
			perStat[stat] = {
				current,
				max,
				ratio: Math.min(max === 0 ? 0 : current / max, 1),
			};
		}

		const current =
			currentStats[Stat.FarmingFortune] ??
			this.computeFortune(Stat.FarmingFortune, player, currentAbilityStatsCache).fortune;
		const max = Math.max(maxStats[Stat.FarmingFortune] ?? 0, current);
		const upgrades = this.getUpgrades({ stats: queryStats }, player);
		const breakdownProgress = this.getBreakdownProgress(maxPet, queryStats, player);

		return [
			{
				name: `${this.info.name} Pet`,
				current,
				max,
				ratio: Math.min(max === 0 ? 0 : current / max, 1),
				stats: Object.keys(perStat).length > 0 ? perStat : undefined,
				item: this.getProgressItem(),
				wiki: this.info.wiki,
				upgrades: upgrades.length > 0 ? upgrades : undefined,
				progress: breakdownProgress.length > 0 ? breakdownProgress : undefined,
			},
		];
	}

	getUpgrades(options?: StatQueryOptions, player?: FarmingPlayer): FortuneUpgrade[] {
		if (!includesFortuneSourceType(options, 'pet')) return [];

		const stats = getQueryStats(options);
		const upgrades: FortuneUpgrade[] = [];
		const maxLevel = this.info.maxLevel ?? 100;

		if (this.level < maxLevel) {
			const nextLevel = this.level + 1;
			const nextPet = this.withChanges({ exp: this.getXpForLevel(nextLevel) });
			const deltaStats = this.getDeltaStats(nextPet, player);
			const increase = deltaStats[Stat.FarmingFortune] ?? 0;

			const upgrade: FortuneUpgrade = {
				title: `${this.info.name} Level ${nextLevel}`,
				increase,
				stats: deltaStats,
				action: UpgradeAction.LevelUp,
				category: UpgradeCategory.Pet,
				wiki: this.info.wiki,
				onto: {
					name: this.getFormattedName(),
					skyblockId: this.type,
				},
				meta: {
					type: 'pet_level',
					itemUuid: this.pet.uuid ?? undefined,
					value: nextLevel,
				},
				conflictKey: `pet-level:${this.pet.uuid ?? this.type}`,
			};

			if (improvesRequestedStat(upgrade, stats)) {
				upgrades.push(upgrade);
			}
		}

		const currentItemId = this.item ? getPetItemId(this.item) : undefined;
		for (const [itemId, item] of Object.entries(FARMING_PET_ITEMS)) {
			if (itemId === currentItemId) continue;

			const nextPet = this.withChanges({ heldItem: itemId });
			const deltaStats = this.getDeltaStats(nextPet, player);
			const increase = deltaStats[Stat.FarmingFortune] ?? 0;
			const upgrade: FortuneUpgrade = {
				title: item.name,
				increase,
				stats: deltaStats,
				action: UpgradeAction.Apply,
				category: UpgradeCategory.Pet,
				purchase: itemId,
				wiki: item.wiki,
				onto: {
					name: this.getFormattedName(),
					skyblockId: this.type,
				},
				cost: {
					items: {
						[itemId]: 1,
					},
				},
				meta: {
					type: 'pet_item',
					id: itemId,
					itemUuid: this.pet.uuid ?? undefined,
				},
				conflictKey: `pet-item:${this.pet.uuid ?? this.type}`,
			};

			if (improvesRequestedStat(upgrade, stats)) {
				upgrades.push(upgrade);
			}
		}

		upgrades.sort((a, b) => (b.increase ?? 0) - (a.increase ?? 0));
		return upgrades;
	}

	getChimeraAffectedStats(multiplier: number): Record<Stat, number> {
		const result: Record<string, number> = {};

		// Item stats
		for (const [key, stat] of Object.entries(this.item?.stats ?? {})) {
			const value = getStatValue(stat, this.options);
			if (result[key]) {
				result[key] += value * multiplier;
			} else {
				result[key] = value * multiplier;
			}
		}

		// Base stats
		for (const [key, stat] of Object.entries(this.info.stats ?? {})) {
			if (stat.type !== FarmingPetStatType.Base) continue;
			const value = getStatValue(stat, this);
			if (result[key]) {
				result[key] += value * multiplier;
			} else {
				result[key] = value * multiplier;
			}
		}

		// Per level stats
		for (const [key, stat] of Object.entries(this.info.perLevelStats ?? {})) {
			if (stat.type !== FarmingPetStatType.Base) continue;
			const value = getStatValue(stat, this);
			if (result[key]) {
				result[key] += value * this.level * multiplier;
			} else {
				result[key] = value * this.level * multiplier;
			}
		}

		return result;
	}

	static isValid(pet: FarmingPetType) {
		return pet.type && pet.type in FARMING_PETS;
	}

	static fromArray(items: EliteItemDto[], options?: PlayerOptions): FarmingPet[] {
		return items
			.filter((item) => FarmingPet.isValid(item))
			.map((item) => new FarmingPet(item, options))
			.sort((a, b) => b.fortune - a.fortune);
	}
}
