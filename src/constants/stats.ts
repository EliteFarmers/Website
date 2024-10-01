import type { PlayerOptions } from "../player/player";

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
	MiningFortune = 'Mining Fortune',
	FarmingFortune = 'Farming Fortune',
	ForagingFortune = 'Foraging Fortune',
	MiningWisdom = 'Mining Wisdom',
	FarmingWisdom = 'Farming Wisdom',
	ForagingWisdom = 'Foraging Wisdom',
	Pristine = 'Pristine',
	BonusPestChance = 'Bonus Pest Chance'
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

export type StatValue<T = unknown, C = PlayerOptions> = StatValueFlat<T, C> | StatValueCalculated<T, C> | StatValueCompound<T, C>; 
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
