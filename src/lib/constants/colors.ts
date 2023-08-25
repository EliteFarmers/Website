export type ColorCode = keyof typeof MINECRAFT_COLORS;

export const MINECRAFT_COLORS = {
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

export type FormattingCode = keyof typeof MINECRAFT_FORMATTING_STYLE;

export const MINECRAFT_FORMATTING_STYLE = {
	'§0': 'color:#000000;',
	'§1': 'color:#0000AA;',
	'§2': 'color:#00AA00;',
	'§3': 'color:#00AAAA;',
	'§4': 'color:#AA0000;',
	'§5': 'color:#AA00AA;',
	'§6': 'color:#FFAA00;',
	'§7': 'color:#AAAAAA;',
	'§8': 'color:#555555;',
	'§9': 'color:#5555FF;',
	'§a': 'color:#55FF55;',
	'§b': 'color:#55FFFF;',
	'§c': 'color:#FF5555;',
	'§d': 'color:#FF55FF;',
	'§e': 'color:#FFFF55;',
	'§f': 'color:#FFFFFF;',
	'§k': 'background-color:currentcolor;border-radius:5px;',
	'§l': 'font-weight:700;',
	'§m': 'text-decoration-line:line-through;',
	'§n': 'text-decoration-line:underline;',
	'§o': 'font-style:italic;',
	'§r': 'color:inherit;',
};
