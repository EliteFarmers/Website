import type { PlusColor, RankName } from '$lib/skyblock';

export const PROFILE_UPDATE_INTERVAL = 1; //1000 * 60 * 10; // 10 minutes
export const LEADERBOARD_UPDATE_INTERVAL = 1000 * 60 * 5; // 5 minutes
export const PLAYER_UPDATE_INTERVAL = 1000 * 60 * 60; // 1 hour
export const ACCOUNT_UPDATE_INTERVAL = 1000 * 60 * 60; // 1 hour

export const EXCLUDED_FIELDS = [
	'objectives',
	'tutorial',
	'quests',
	'visited_zones',
	'visited_modes',
	'temp_stat_buffs',
	'disabled_potion_effects',
	'paused_effects',
	'active_effects',
	'achievement_spawned_island_types',
	'autopet',
	'experimentation',
	'harp_quest',
	'trapper_quest',
	'favorite_arrow',
	'backpack_icons',
	'sacks_counts',
	'fishing_bag',
	'candy_inventory_contents',
	'personal_bank_upgrade',
	'wardrobe_equipped_slot',
];

export const INVENTORY_FIELDS_RENAME = {
	inv_contents: 'player',
	inv_armor: 'armor',
	ender_chest_contents: 'ender_chest',
	backpack_contents: 'backpacks',
	talisman_bag: 'talismans',
	equippment_contents: 'equipment',
	wardrobe_contents: 'wardrobe',
	personal_vault_contents: 'vault',
	potion_bag: 'potions',
	quiver: 'quiver',
};

export const MOVE_TO_STATS = ['first_join', 'first_join_hub', 'last_death', 'death_count', 'fishing_treasure_caught'];

export const KEPT_PLAYER_FIELDS = [
	'firstLogin',
	'lastLogin',
	'socialMedia',
	'karma',
	'rank',
	'rankPlusColor',
	'newPackageRank',
	'monthlyPackageRank',
	'userLanguage',
	'skyblock_extra',
	'scorpius_bribe_',
	'claimed_',
];

export const RANKS: { [color in RankName]: { color: string; tag: string; plus?: string; plusColor?: string } } = {
	OWNER: {
		color: '#c43c3c',
		tag: 'OWNER',
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
	'PIG+++': {
		color: '#e668c6',
		tag: 'PIG',
		plus: '+++',
		plusColor: '#33aec3',
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
	DARK_BLUE: '#0b277a',
	DARK_GREEN: '#00aa00',
	DARK_AQUA: '#038d8d',
	DARK_RED: '#920909',
	DARK_PURPLE: '#a305a3',
	GOLD: '#d88f07',
	GRAY: '#636363',
	DARK_GRAY: '#2f2f2f',
	BLUE: '#4444f3',
	GREEN: '#40bb40',
	AQUA: '#33aec3',
	RED: '#c43c3c',
	LIGHT_PURPLE: '#e668c6',
	YELLOW: 'efc721',
	WHITE: '#929292',
};
