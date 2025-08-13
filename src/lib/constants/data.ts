import type { PlusColor, RankName } from '$lib/skyblock';

export const PROFILE_UPDATE_INTERVAL = 1000 * 60 * 15; // 15 minutes
export const LEADERBOARD_UPDATE_INTERVAL = 1000 * 60 * 5; // 5 minutes
export const PLAYER_UPDATE_INTERVAL = 1000 * 60 * 60; // 1 hour
export const ACCOUNT_UPDATE_INTERVAL = 1000 * 60 * 60; // 1 hour

interface RankDefault {
	color: string;
	tag: string;
	style?: string;
	plus?: string;
	plusColor?: string;
	raw?: string;
}

export const RANKS: { [color in RankName]: RankDefault } & { [key: string]: RankDefault } = {
	OWNER: {
		color: '#c43c3c',
		tag: 'OWNER',
	},
	STAFF: {
		tag: 'ዞ',
		color: '#ffaa00',
	},
	ADMIN: {
		color: '#c43c3c',
		tag: 'ADMIN',
	},
	GAME_MASTER: {
		color: '#00aa00',
		tag: 'GM',
	},
	YOUTUBER: {
		color: '#c43c3c',
		tag: 'YOUTUBE',
	},
	SUPERSTAR: {
		color: '#d88f07',
		tag: 'MVP',
		plus: '++',
		plusColor: '#c43c3c',
	},
	MVP_PLUS: {
		color: '#33aec3',
		tag: 'MVP',
		plus: '+',
		plusColor: '#c43c3c',
	},
	MVP: {
		color: '#33aec3',
		tag: 'MVP',
	},
	VIP_PLUS: {
		color: '#40bb40',
		tag: 'VIP',
		plus: '+',
		plusColor: '#d88f07',
	},
	VIP: {
		color: '#40bb40',
		tag: 'VIP',
	},
	MAYOR: {
		color: '#e668c6',
		tag: 'MAYOR',
	},
	MINISTER: {
		color: '#c43c3c',
		tag: 'MINISTER',
	},
};

export const RANK_PLUS_COLORS: { [color in PlusColor]?: string } = {
	BLACK: '#000000',
	DARK_BLUE: '#0000aa',
	DARK_GREEN: '#00aa00',
	DARK_AQUA: '#00aaaa',
	DARK_RED: '#aa0000',
	DARK_PURPLE: '#aa00aa',
	GOLD: '#ffaa00',
	GRAY: '#aaaaaa',
	DARK_GRAY: '#555555',
	BLUE: '#5555ff',
	GREEN: '#55ff55',
	AQUA: '#55ffff',
	RED: '#ff5555',
	LIGHT_PURPLE: '#ff55ff',
	YELLOW: '#ffff55',
	WHITE: '#ffffff',
};

export const SKYBLOCK_MONTHS = [
	'Early Spring',
	'Spring',
	'Late Spring',
	'Early Summer',
	'Summer',
	'Late Summer',
	'Early Autumn',
	'Autumn',
	'Late Autumn',
	'Early Winter',
	'Winter',
	'Late Winter',
];
