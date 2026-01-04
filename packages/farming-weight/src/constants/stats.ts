import type { PlayerOptions } from '../player/playeroptions.js';

export enum Stat {
	Strength = 'Strength',
	Health = 'Health',
	Defense = 'Defense',
	Speed = 'Speed',
	Intelligence = 'Intelligence',
	CritChance = 'Crit Chance',
	CritDamage = 'Crit Damage',
	AttackSpeed = 'Attack Speed',
	AbilityDamage = 'Ability Damage',
	MagicFind = 'Magic Find',
	PetLuck = 'Pet Luck',
	TrueDefense = 'True Defense',
	SeaCreatureChance = 'Sea Creature Chance',
	Ferocity = 'Ferocity',
	MiningSpeed = 'Mining Speed',
	MiningFortune = 'mining_fortune',
	FarmingFortune = 'farming_fortune',
	CactusFortune = 'cactus_fortune',
	CarrotFortune = 'carrot_fortune',
	CocoaBeanFortune = 'cocoa_beans_fortune',
	MelonFortune = 'melon_fortune',
	MushroomFortune = 'mushroom_fortune',
	NetherWartFortune = 'nether_wart_fortune',
	PotatoFortune = 'potato_fortune',
	PumpkinFortune = 'pumpkin_fortune',
	SugarCaneFortune = 'sugar_cane_fortune',
	WheatFortune = 'wheat_fortune',
	SunflowerFortune = 'sunflower_fortune',
	MoonflowerFortune = 'moonflower_fortune',
	WildRoseFortune = 'wild_rose_fortune',
	PestKillFortune = 'pest_kill_fortune',
	ForagingFortune = 'foraging_fortune',
	MiningWisdom = 'Mining Wisdom',
	FarmingWisdom = 'Farming Wisdom',
	ForagingWisdom = 'Foraging Wisdom',
	Pristine = 'Pristine',
	BonusPestChance = 'Bonus Pest Chance',
	PestCooldownReduction = 'Pest Cooldown Reduction',
	FishingSpeed = 'Fishing Speed',
}

/**
 * Mapping of parent stats to their child stats.
 * For example, FarmingFortune is a parent stat for WheatFortune, CarrotFortune, etc.
 * This allows for querying a general stat (e.g., FarmingFortune) and getting all specific stats that fall under it.
 */
export const STAT_GROUPS: Partial<Record<Stat, Set<Stat>>> = {
	[Stat.FarmingFortune]: new Set([
		Stat.CactusFortune,
		Stat.CarrotFortune,
		Stat.CocoaBeanFortune,
		Stat.MelonFortune,
		Stat.MushroomFortune,
		Stat.NetherWartFortune,
		Stat.PotatoFortune,
		Stat.PumpkinFortune,
		Stat.SugarCaneFortune,
		Stat.SunflowerFortune,
		Stat.MoonflowerFortune,
		Stat.WildRoseFortune,
		Stat.WheatFortune,
	]),
};

/**
 * Expand a stat query to include child stats from stat groups.
 * Returns an array containing the original stat plus any grouped child stats.
 */
export function expandStatQuery(stat: Stat): Stat[] {
	const children = STAT_GROUPS[stat];
	if (children) {
		return [stat, ...children];
	}
	return [stat];
}

/**
 * Mapping of stats to the list of stats that contribute to them.
 * This is effectively the reverse of STAT_GROUPS, but pre-calculated for efficient lookup.
 *
 * Example: WheatFortune is improved by sources that provide WheatFortune OR FarmingFortune.
 * So CONTRIBUTORY_STATS[WheatFortune] = [WheatFortune, FarmingFortune].
 */
export const CONTRIBUTORY_STATS: Partial<Record<Stat, Stat[]>> = {};

// Initialize contributory stats
for (const stat of Object.values(Stat)) {
	const contributors = [stat];

	// Check all groups to see if this stat is a child of a group
	for (const [parent, children] of Object.entries(STAT_GROUPS)) {
		if (children.has(stat as Stat)) {
			contributors.push(parent as Stat);
		}
	}

	if (contributors.length > 1) {
		CONTRIBUTORY_STATS[stat] = contributors;
	}
}

/**
 * Get all stats that contribute to the target stat.
 * Returns [targetStat, ...parentStats].
 */
export function getContributoryStats(stat: Stat): Stat[] {
	return CONTRIBUTORY_STATS[stat] ?? [stat];
}

export function getStatValue<T = unknown, C = PlayerOptions>(stat?: StatValue<T, C>, option?: C) {
	if (!stat || (stat.exists && option && !stat.exists(option))) return 0;

	let value = 0;
	if ('value' in stat) {
		value += stat.value;
	}

	if ('calculated' in stat && option) {
		value += stat.calculated(option);
	}

	return value;
}

export type StatValue<T = unknown, C = PlayerOptions> =
	| StatValueFlat<T, C>
	| StatValueCalculated<T, C>
	| StatValueCompound<T, C>;
export type StatValueCompound<T, C = PlayerOptions> = StatValueFlat<T, C> & StatValueCalculated<T, C>;
export type StatsRecord<T = unknown, C = PlayerOptions> = Partial<Record<Stat, StatValue<T, C>>>;

export interface StatValueBase<T, C = PlayerOptions> {
	name?: string;
	exists?: (opt: C) => boolean;
	type?: T;
}

export interface StatValueFlat<T, C = PlayerOptions> extends StatValueBase<T, C> {
	value: number;
}

export interface StatValueCalculated<T, C = PlayerOptions> extends StatValueBase<T, C> {
	calculated: (opt: C) => number;
}
export type BreakDownEntry = { value: number; stat: Stat };
export type StatBreakdown = Record<string, BreakDownEntry>;
export interface StatValueCalculated<T, C = PlayerOptions> extends StatValueBase<T, C> {
	calculated: (opt: C) => number;
}

export const CROP_FORTUNE_STATS: ReadonlySet<Stat> = new Set([
	Stat.CactusFortune,
	Stat.CarrotFortune,
	Stat.CocoaBeanFortune,
	Stat.MelonFortune,
	Stat.MushroomFortune,
	Stat.NetherWartFortune,
	Stat.PotatoFortune,
	Stat.PumpkinFortune,
	Stat.SugarCaneFortune,
	Stat.SunflowerFortune,
	Stat.MoonflowerFortune,
	Stat.WildRoseFortune,
	Stat.WheatFortune,
]);

export function statMatchesQuery(statToCheck: Stat, queryStat: Stat): boolean {
	if (statToCheck === queryStat) return true;
	if (STAT_GROUPS[queryStat]?.has(statToCheck)) return true;

	return false;
}

export const STAT_NAMES: Record<Stat, string> = {
	[Stat.Strength]: 'Strength',
	[Stat.Health]: 'Health',
	[Stat.Defense]: 'Defense',
	[Stat.Speed]: 'Speed',
	[Stat.Intelligence]: 'Intelligence',
	[Stat.CritChance]: 'Crit Chance',
	[Stat.CritDamage]: 'Crit Damage',
	[Stat.AttackSpeed]: 'Attack Speed',
	[Stat.AbilityDamage]: 'Ability Damage',
	[Stat.MagicFind]: 'Magic Find',
	[Stat.PetLuck]: 'Pet Luck',
	[Stat.TrueDefense]: 'True Defense',
	[Stat.SeaCreatureChance]: 'Sea Creature Chance',
	[Stat.Ferocity]: 'Ferocity',
	[Stat.MiningSpeed]: 'Mining Speed',
	[Stat.MiningFortune]: 'Mining Fortune',
	[Stat.FarmingFortune]: 'Farming Fortune',
	[Stat.CactusFortune]: 'Cactus Fortune',
	[Stat.CarrotFortune]: 'Carrot Fortune',
	[Stat.CocoaBeanFortune]: 'Cocoa Bean Fortune',
	[Stat.MelonFortune]: 'Melon Fortune',
	[Stat.MushroomFortune]: 'Mushroom Fortune',
	[Stat.NetherWartFortune]: 'Nether Wart Fortune',
	[Stat.PotatoFortune]: 'Potato Fortune',
	[Stat.PumpkinFortune]: 'Pumpkin Fortune',
	[Stat.SugarCaneFortune]: 'Sugar Cane Fortune',
	[Stat.WheatFortune]: 'Wheat Fortune',
	[Stat.SunflowerFortune]: 'Sunflower Fortune',
	[Stat.MoonflowerFortune]: 'Moonflower Fortune',
	[Stat.WildRoseFortune]: 'Wild Rose Fortune',
	[Stat.PestKillFortune]: 'Pest Kill Fortune',
	[Stat.ForagingFortune]: 'Foraging Fortune',
	[Stat.MiningWisdom]: 'Mining Wisdom',
	[Stat.FarmingWisdom]: 'Farming Wisdom',
	[Stat.ForagingWisdom]: 'Foraging Wisdom',
	[Stat.Pristine]: 'Pristine',
	[Stat.BonusPestChance]: 'Bonus Pest Chance',
	[Stat.PestCooldownReduction]: 'Pest Cooldown Reduction',
	[Stat.FishingSpeed]: 'Fishing Speed',
};
