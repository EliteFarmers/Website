import type { Rarity } from "$lib/skyblock";

// Minecraft color codes
export const COLOR_CODES = {
	'§0': '#000000',
	'§1': '#0000AA',
	'§2': '#00AA00',
	'§3': '#00AAAA',
	'§4': '#AA0000',
	'§5': '#AA00AA',
	'§6': '#FFAA00',
	'§7': '#AAAAAA',
	'§8': '#555555',
	'§9': '#5555FF',
	'§a': '#55FF55',
	'§b': '#55FFFF',
	'§c': '#FF5555',
	'§d': '#FF55FF',
	'§e': '#FFFF55',
	'§f': '#FFFFFF',
};

export const RARITY_COLORS_CODES: Record<Rarity, ColorCode> = {
	COMMON: '§7',
	UNCOMMON: '§a',
	RARE: '§9',
	EPIC: '§5',
	LEGENDARY: '§6',
	MYTHIC: '§d',
	SPECIAL: '§c',
	SUPREME: '§4',
};

export type ColorCode = keyof typeof COLOR_CODES;