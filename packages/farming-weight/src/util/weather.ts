import { Stat } from '../constants/stats.js';
import { SkyBlockTime } from './skyblocktime.js';

const SKYBLOCK_DAY_SECONDS = 20 * 60;
const WEATHER_INTERVAL_SECONDS = 3 * SKYBLOCK_DAY_SECONDS;

export interface WeatherDetails {
	name: string;
	bonuses: { stat: Stat; value: number }[];
	specialEffect?: string;
}

function event(name: string, bonuses: [Stat, number][], specialEffect?: string): WeatherDetails {
	return { name, bonuses: bonuses.map(([stat, value]) => ({ stat, value })), specialEffect };
}

export const GARDEN_WEATHER = {
	mild: event('Rain', [
		[Stat.FarmingFortune, 25],
		[Stat.BonusPestChance, 5],
		[Stat.Overbloom, 2.5],
	]),
	extreme: event(
		'Blooming',
		[
			[Stat.FarmingFortune, 50],
			[Stat.BonusPestChance, 10],
			[Stat.Overbloom, 5],
		],
		'+10% Sowdust from all sources'
	),
};

export interface WeatherIsland {
	id: string;
	name: string;
	mild: WeatherDetails;
	extreme: WeatherDetails;
}

export const WEATHER_ISLANDS: WeatherIsland[] = [
	{ id: 'garden', name: 'Garden', ...GARDEN_WEATHER },
	{
		id: 'spiders-den',
		name: "Spider's Den",
		mild: event(
			'Rain',
			[
				[Stat.FishingSpeed, 25],
				[Stat.CombatWisdom, 5],
				[Stat.SeaCreatureChance, 2.5],
			],
			'Rain Slimes spawn around the island'
		),
		extreme: event(
			'Thunderstorm',
			[
				[Stat.FishingSpeed, 50],
				[Stat.CombatWisdom, 10],
				[Stat.SeaCreatureChance, 5],
			],
			'Rain Slimes and Toxic Rain Slimes spawn around the island'
		),
	},
	{
		id: 'backwater-bayou',
		name: 'Backwater Bayou',
		mild: event('Smog', [
			[Stat.FishingSpeed, 25],
			[Stat.TreasureChance, 1],
			[Stat.SeaCreatureChance, 2.5],
		]),
		extreme: event(
			'Acid Rain',
			[
				[Stat.FishingSpeed, 50],
				[Stat.TreasureChance, 2.5],
				[Stat.SeaCreatureChance, 5],
			],
			'+20% chance to catch two pieces of Junk at once'
		),
	},
	{
		id: 'crimson-isle',
		name: 'Crimson Isle',
		mild: event('Ashfall', [
			[Stat.FishingSpeed, 25],
			[Stat.TrophyChance, 2.5],
			[Stat.CombatWisdom, 5],
		]),
		extreme: event(
			'Hellstorm',
			[
				[Stat.FishingSpeed, 50],
				[Stat.TrophyChance, 5],
				[Stat.CombatWisdom, 10],
			],
			'Trophy Fish are 5% more likely to be Gold or Diamond'
		),
	},
	{
		id: 'moonglade-marsh',
		name: 'Moonglade Marsh',
		mild: event('Moonfall', [
			[Stat.FishingSpeed, 25],
			[Stat.ForagingFortune, 10],
			[Stat.SeaCreatureChance, 2.5],
		]),
		extreme: event(
			'Thunderstorm',
			[
				[Stat.FishingSpeed, 50],
				[Stat.ForagingFortune, 25],
				[Stat.SeaCreatureChance, 5],
			],
			'+10% Forest Whispers from all sources'
		),
	},
	{
		id: 'lotus-atoll',
		name: 'Lotus Atoll',
		mild: event(
			'Tropical Rain',
			[
				[Stat.FishingSpeed, 25],
				[Stat.TrophyChance, 2.5],
				[Stat.SeaCreatureChance, 2.5],
			],
			'Wetlands Frogs can be fished up'
		),
		extreme: event(
			'Blossoming',
			[
				[Stat.FishingSpeed, 50],
				[Stat.TrophyChance, 5],
				[Stat.SeaCreatureChance, 5],
			],
			'Wetlands Frogs can be fished up. Trophy Frogs are 5% more likely to be Gold or Diamond'
		),
	},
	{
		id: 'dwarven-mines',
		name: 'Dwarven Mines',
		mild: event('Breeze', [
			[Stat.MiningSpeed, 100],
			[Stat.MiningFortune, 25],
			[Stat.FishingSpeed, 25],
		]),
		extreme: event(
			'Mist',
			[
				[Stat.MiningSpeed, 250],
				[Stat.MiningFortune, 50],
				[Stat.FishingSpeed, 50],
			],
			'+10% Mithril Powder from all sources'
		),
	},
	{
		id: 'crystal-hollows',
		name: 'Crystal Hollows',
		mild: event('Breeze', [
			[Stat.MiningSpeed, 100],
			[Stat.MiningFortune, 25],
			[Stat.FishingSpeed, 25],
		]),
		extreme: event(
			'Rockfall',
			[
				[Stat.MiningSpeed, 250],
				[Stat.MiningFortune, 50],
				[Stat.FishingSpeed, 50],
			],
			'+10% Gemstone Powder from all sources'
		),
	},
	{
		id: 'glacite-tunnels',
		name: 'Glacite Tunnels',
		mild: event('Breeze', [
			[Stat.MiningSpeed, 100],
			[Stat.MiningFortune, 25],
			[Stat.FishingSpeed, 25],
		]),
		extreme: event(
			'Snowstorm',
			[
				[Stat.MiningSpeed, 250],
				[Stat.MiningFortune, 50],
				[Stat.FishingSpeed, 50],
			],
			'+10% Glacite Powder from all sources'
		),
	},
	{
		id: 'the-end',
		name: 'The End',
		mild: event('Wispfall', [
			[Stat.MiningFortune, 25],
			[Stat.CombatWisdom, 5],
			[Stat.Tracking, 1],
		]),
		extreme: event(
			'Voidstorm',
			[
				[Stat.MiningFortune, 50],
				[Stat.CombatWisdom, 10],
				[Stat.Tracking, 2.5],
			],
			'+1% chance to spawn Superior Dragons'
		),
	},
	{
		id: 'jerrys-workshop',
		name: "Jerry's Workshop",
		mild: event('Breeze', [
			[Stat.FishingSpeed, 25],
			[Stat.SeaCreatureChance, 5],
			[Stat.TreasureChance, 2.5],
		]),
		extreme: event(
			'Blizzard',
			[
				[Stat.FishingSpeed, 50],
				[Stat.SeaCreatureChance, 10],
				[Stat.TreasureChance, 5],
			],
			'+10% Ice Essence from all sources'
		),
	},
];

export interface WeatherWindow {
	start: number;
	end: number;
	type: 'mild' | 'extreme';
}

function weatherWindow(start: number): WeatherWindow {
	const date = new SkyBlockTime(start * 1000);
	const extreme = date.dayOfYear % 9 === 6;
	return { start, end: start + SKYBLOCK_DAY_SECONDS, type: extreme ? 'extreme' : 'mild' };
}

export function getWeatherForecast(nowUnixSeconds: number, length = 6) {
	const date = new SkyBlockTime(nowUnixSeconds * 1000);
	const current = date.dayOfYear % 3 === 0 ? weatherWindow(date.dayUnixSeconds) : null;
	const nextStart = date.dayUnixSeconds + (3 - (date.dayOfYear % 3)) * SKYBLOCK_DAY_SECONDS;
	const next = weatherWindow(nextStart);
	const upcoming = Array.from({ length }, (_, index) => weatherWindow(nextStart + index * WEATHER_INTERVAL_SECONDS));
	return { current, next, upcoming };
}
