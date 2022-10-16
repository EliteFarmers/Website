export const PROPER_CROP_NAME: Partial<Record<string, string>> = {
	CACTUS: 'Cactus',
	CARROT_ITEM: 'Carrot',
	'INK_SACK:3': 'Cocoa Beans',
	MELON: 'Melon',
	MUSHROOM_COLLECTION: 'Mushroom',
	NETHER_STALK: 'Nether Wart',
	POTATO_ITEM: 'Potato',
	PUMPKIN: 'Pumpkin',
	SUGAR_CANE: 'Sugar Cane',
	WHEAT: 'Wheat',
};

export const API_CROP_TO_CROP = {
	WHEAT: 'wheat',
	POTATO_ITEM: 'potato',
	CARROT_ITEM: 'carrot',
	MELON: 'melon',
	PUMPKIN: 'pumpkin',
	CACTUS: 'cactus',
	SUGAR_CANE: 'sugar_cane',
	INK_SACK: 'cocoa',
	'INK_SACK:3': 'cocoa',
	MUSHROOM_COLLECTION: 'mushroom',
	NETHER_STALK: 'nether_wart',
};

export const PROPER_CROP_TO_MINION: Partial<Record<string, string>> = {
	Cactus: 'CACTUS',
	Carrot: 'CARROT',
	'Cocoa Beans': 'COCOA',
	Melon: 'MELON',
	Mushroom: 'MUSHROOM',
	'Nether Wart': 'NETHER_WARTS',
	Potato: 'POTATO',
	Pumpkin: 'PUMPKIN',
	'Sugar Cane': 'SUGAR_CANE',
	Wheat: 'WHEAT',
};
