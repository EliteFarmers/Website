import { Crop, getCropFromName, Stat } from 'farming-weight';
import type { MemberCosmeticsDto, PlayerDataDto, UserSettingsDto } from './api';
import { MINECRAFT_COLORS, MINECRAFT_FORMATTING_STYLE, type FormattingCode } from './constants/colors';
import { RANK_PLUS_COLORS, RANKS, SKYBLOCK_MONTHS } from './constants/data';
import type { LeaderboardInfo } from './constants/leaderboards';
import { DEFAULT_SKILL_CAPS, LEVEL_XP, RUNE_LEVELS, SOCIAL_XP } from './constants/levels';
import type { PlusColor, RankName, Skill } from './skyblock';

function getLevelCap(skill: Skill) {
	return DEFAULT_SKILL_CAPS[skill];
}

export function getSkillLevel(skill: Skill, xp: number, max?: number) {
	let level = 0;

	const cap = max ?? getLevelCap(skill);

	let XP_CHART = LEVEL_XP as Record<number, number>;
	if (skill === 'runecrafting') {
		XP_CHART = RUNE_LEVELS;
	} else if (skill === 'social') {
		XP_CHART = SOCIAL_XP;
	}

	const levels = Object.values(XP_CHART).slice(0, cap);

	for (const xpRequired of levels) {
		if ((xp -= xpRequired) >= 0) level++;
		else {
			xp += xpRequired;
			break;
		}
	}

	return {
		level,
		xp,
		chart: XP_CHART,
	};
}

export function getLevelProgress(skill: Skill, xp: number, max?: number) {
	const { level, xp: remainder, chart } = getSkillLevel(skill, xp, max);

	if ((max && level >= max) || level === getLevelCap(skill)) {
		return {
			level: level,
			ratio: 1,
			progress: remainder,
		};
	}

	const nextReq = chart[level + 1];

	return {
		level: level,
		ratio: remainder / nextReq,
		progress: remainder,
		goal: nextReq,
		next: level + 1,
	};
}

export function toReadable(num: number, locale = 'en-US', minDigits = 4) {
	const formatter = new Intl.NumberFormat(locale, {
		notation: 'compact',
		minimumSignificantDigits: minDigits,
		maximumSignificantDigits: 4,
	});
	const formatted = formatter.format(num);

	// Add a space between the number and the unit
	return formatted.replace(/(\d)([a-z]+)/i, '$1 $2');
}

/**
 *
 * Converts a skyblock date to unix seconds.
 *
 * @param  {number} sbYear
 * @param  {number} sbMonth
 * @param  {number} sbDay
 * @returns Date
 */
export function getTimeStamp(sbYear: number, sbMonth: number, sbDay: number): number {
	// SkyBlock epoch is 2019/06/11
	const epochSeconds = 1560275700;

	// Total skyblock days passed since epoch
	const totalDays = sbYear * 372 + sbMonth * 31 + sbDay;

	// Convert skyblock days to real life time
	const realLifeSeconds = totalDays * 20 * 60;

	// Convert real life time to unix time
	const unixTime = epochSeconds + realLifeSeconds;

	// Convert unix time to date object
	return unixTime;
}
/**
 *
 * Converts a skyblock contest key string to unix seconds.
 *
 * @param  {string} contestKey
 */
export function getContestTimeStamp(contestKey: string) {
	// contest keys are in this format: '160:6_30:NETHER_STALK'
	// Parse the date and time from the contest key
	const split = contestKey.split(':');
	const skyblockYear = +split[0];
	const skyblockMonth = +split[1].split('_')[0] - 1;
	const skyblockDay = +split[1].split('_')[1] - 1;

	return getTimeStamp(skyblockYear, skyblockMonth, skyblockDay);
}

/**
 *
 * Converts a unix timestamp to a skyblock date.
 *
 * @param  {string|number|bigint} unixSeconds
 */
export function getSkyblockDate(unixSeconds: string | number | bigint) {
	// SkyBlock epoch is 2019/06/11
	const epochSeconds = 1560275700;

	// Convert unix time to real life time
	const realLifeSeconds = Number(unixSeconds) - epochSeconds;

	// Convert real life time to skyblock days
	const totalDays = realLifeSeconds / (20 * 60);

	// Convert skyblock days to skyblock year, month, and day
	const year = Math.floor(totalDays / 372);
	const month = Math.floor((totalDays % 372) / 31);

	const day = Math.floor((totalDays % 372) % 31);

	return { year, month, day };
}

export function getReadableSkyblockDate(unixSeconds: string | number | bigint) {
	const { year, month, day } = getSkyblockDate(unixSeconds);

	const suffix = appendOrdinalSuffix(day + 1);

	return `${SKYBLOCK_MONTHS[+month]} ${suffix}, Year ${+year + 1}`; // Year is 1 behind in api
}

export function getSkyblockMonth(month: number) {
	return SKYBLOCK_MONTHS[month - 1];
}

export function getReadableSkyblockMonthDay(unixSeconds: string | number) {
	const { month, day } = getSkyblockDate(unixSeconds);

	const suffix = appendOrdinalSuffix(day + 1);

	return `${SKYBLOCK_MONTHS[+month]} ${suffix}`;
}

export function appendOrdinalSuffix(i: number) {
	const j = i % 10;
	const k = i % 100;

	if (j === 1 && k !== 11) return `${i}st`;
	if (j === 2 && k !== 12) return `${i}nd`;
	if (j === 3 && k !== 13) return `${i}rd`;

	return `${i}th`;
}

export function getRankInformation(player?: PlayerDataDto | null) {
	const rankName = GetRankName(player);
	const defaults = GetRankDefaults(rankName);
	if (!defaults) {
		if (!rankName) return undefined;
		return {
			raw: rankName,
			color:
				MINECRAFT_COLORS[(rankName?.match(/(§\w)/)?.[1] || '§0') as keyof typeof MINECRAFT_COLORS] || '#000000',
			tag: rankName?.replace(/§\w/g, '').match(/\[(.+?)\]/)?.[1] || '',
		} as ReturnType<typeof GetRankDefaults>;
	}

	if (player?.rankPlusColor && defaults) {
		defaults.plusColor = convertPlusColorToHex(player.rankPlusColor);
	}

	return defaults;
}

export function GetRankName(player?: PlayerDataDto | null): string | undefined {
	if (!player) return undefined;

	if (player.prefix) {
		return player.prefix;
	}

	if (player.rank && player.rank !== 'NORMAL') {
		return player.rank;
	}

	if (player.monthlyPackageRank && player.monthlyPackageRank !== 'NONE') {
		return player.monthlyPackageRank;
	}

	if (player.newPackageRank && player.newPackageRank !== 'NONE') {
		return player.newPackageRank;
	}

	return player.packageRank && player.packageRank !== 'NONE' ? player.packageRank : undefined;
}

export function GetRankDefaults(rank?: RankName | string) {
	if (!rank) return undefined;

	return RANKS[rank as keyof typeof RANKS];
}

export function convertPlusColorToHex(color?: PlusColor | string) {
	if (!color) return undefined;

	return RANK_PLUS_COLORS[color as keyof typeof RANK_PLUS_COLORS] ?? undefined;
}

export function RoundToFixed(num: number | null, fixed = 2) {
	if (num === null || !isFinite(num)) return 0;

	const divider = Math.pow(10, fixed);
	const rounded = Math.round((num + Number.EPSILON) * divider) / divider;

	return isNaN(rounded) ? 0 : rounded;
}

export function FormatMinecraftText(line: string) {
	if (line === '') return '<br>';

	return line
		.replaceAll(/§([g-z])/g, (_, code) => `⠀${code}`)
		.replaceAll(/(§[0-9a-f])([^§]*)/g, (_, code, text) => {
			return `<span style="${MINECRAFT_FORMATTING_STYLE[code as FormattingCode]}">${text}</span>`;
		})
		.replaceAll(/(⠀[g-z])([^⠀]*)/g, (_, code, text) => {
			return `<span style="${
				MINECRAFT_FORMATTING_STYLE[code.replace('⠀', '§') as FormattingCode]
			}">${text}</span>`;
		});
}

// https://www.builder.io/blog/relative-time
export function getRelativeTimeString(date: Date | number, lang: string): string {
	// Allow dates or times to be passed
	const timeMs = typeof date === 'number' ? date : date.getTime();

	// Get the amount of seconds between the given date and now
	const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

	// Array reprsenting one minute, hour, day, week, month, etc in seconds
	const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];

	// Array equivalent to the above but in the string representation of the units
	const units: Intl.RelativeTimeFormatUnit[] = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];

	// Grab the ideal cutoff unit
	const unitIndex = cutoffs.findIndex((cutoff) => cutoff > Math.abs(deltaSeconds));

	// Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
	// is one day in seconds, so we can divide our seconds by this to get the # of days
	const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

	// Intl.RelativeTimeFormat do its magic
	const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
	return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

export function getCountdown(ms: number) {
	const { days, hours, minutes, seconds } = getCountdownParts(ms);
	return (days ? days + 'd ' : '') + (hours ? hours + 'h ' : '') + (minutes ? minutes + 'm ' : '') + seconds + 's ';
}

export function getCountdownParts(ms: number) {
	// Time calculations for days, hours, minutes and seconds
	const days = Math.floor(ms / (1000 * 60 * 60 * 24));
	const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((ms % (1000 * 60)) / 1000);

	return {
		days: days,
		hours: hours,
		minutes: minutes,
		seconds: seconds,
	};
}

export function getCropColor(crop: string | Crop) {
	const cropKey = getCropFromName(crop);

	switch (cropKey) {
		case Crop.Cactus:
			return '#3b5b1d';
		case Crop.Carrot:
			return '#ff8e09';
		case Crop.CocoaBeans:
			return '#61381d';
		case Crop.Melon:
			return '#bb170b';
		case Crop.Mushroom:
			return '#725643';
		case Crop.NetherWart:
			return '#5c151a';
		case Crop.Potato:
			return '#e9ba62';
		case Crop.Pumpkin:
			return '#a0560b';
		case Crop.SugarCane:
			return '#82a859';
		case Crop.Seeds:
		case Crop.Wheat:
		default:
			return '#d5da45';
	}
}

export function formatIgn(ign?: string | null, meta?: MemberCosmeticsDto | null, settings?: UserSettingsDto): string {
	if ((!meta && !settings) || !ign) return ign ?? '';
	const prefix = meta?.prefix || settings?.prefix || '';
	const suffix = meta?.suffix || settings?.suffix || '';

	return `${prefix} ${ign} ${suffix}`;
}

export function formatLeaderboardAmount(leaderboard?: LeaderboardInfo, amount = 0): string {
	const options = getLeaderboardFormatOptions(leaderboard);
	return leaderboard?.id.startsWith('skyblockxp')
		? (amount / 100).toLocaleString(undefined, options)
		: amount.toLocaleString(undefined, options);
}

export function getLeaderboardFormatOptions(leaderboard?: LeaderboardInfo): Intl.NumberFormatOptions {
	if (!leaderboard) return {};

	if (leaderboard.id.startsWith('skyblockxp')) {
		return {
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
		};
	}

	if (leaderboard.scoreDataType.toString() === 'Decimal') {
		return {
			maximumFractionDigits: 1,
			minimumFractionDigits: 1,
		};
	}

	return {};
}

export function getStatColor(stat: Stat, ratio: number): string | null {
	switch (stat) {
		case Stat.MelonFortune:
			return ratio < 1 ? 'bg-melon/70' : 'bg-melon';
		case Stat.PumpkinFortune:
			return ratio < 1 ? 'bg-pumpkin/70' : 'bg-pumpkin';
		case Stat.CactusFortune:
			return ratio < 1 ? 'bg-cactus/70' : 'bg-cactus';
		case Stat.SugarCaneFortune:
			return ratio < 1 ? 'bg-sugarcane/70' : 'bg-sugarcane';
		case Stat.CarrotFortune:
			return ratio < 1 ? 'bg-carrot/70' : 'bg-carrot';
		case Stat.PotatoFortune:
			return ratio < 1 ? 'bg-potato/70' : 'bg-potato';
		case Stat.WheatFortune:
			return ratio < 1 ? 'bg-wheat/70' : 'bg-wheat';
		case Stat.MushroomFortune:
			return ratio < 1 ? 'bg-mushroom/70' : 'bg-mushroom';
		case Stat.CocoaBeanFortune:
			return ratio < 1 ? 'bg-cocoa/70' : 'bg-cocoa';
		case Stat.MoonflowerFortune:
			return ratio < 1 ? 'bg-moonflower/70' : 'bg-moonflower';
		case Stat.NetherWartFortune:
			return ratio < 1 ? 'bg-netherwart/70' : 'bg-netherwart';
		case Stat.SunflowerFortune:
			return ratio < 1 ? 'bg-sunflower/70' : 'bg-sunflower';
		case Stat.WildRoseFortune:
			return ratio < 1 ? 'bg-wildrose/70' : 'bg-wildrose';
		case Stat.FarmingFortune:
			return ratio < 1 ? 'bg-progress/70' : 'bg-progress';
		default:
			return 'bg-muted';
	}
}
