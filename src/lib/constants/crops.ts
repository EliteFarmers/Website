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
	cactus: 'Cactus',
	carrot: 'Carrot',
	cocoa: 'Cocoa Beans',
	melon: 'Melon',
	mushroom: 'Mushroom',
	netherwart: 'Nether Wart',
	potato: 'Potato',
	pumpkin: 'Pumpkin',
	sugarcane: 'Sugar Cane',
	wheat: 'Wheat',
};

export const API_CROP_TO_CROP = {
	WHEAT: 'wheat',
	POTATO_ITEM: 'potato',
	CARROT_ITEM: 'carrot',
	MELON: 'melon',
	PUMPKIN: 'pumpkin',
	CACTUS: 'cactus',
	SUGAR_CANE: 'sugarcane',
	INK_SACK: 'cocoa',
	'INK_SACK:3': 'cocoa',
	MUSHROOM_COLLECTION: 'mushroom',
	NETHER_STALK: 'netherwart',
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

export const PROPER_CROP_TO_IMG: Partial<Record<string, string>> = {
	Cactus: '/images/crops/cactus.webp',
	Carrot: '/images/crops/carrot.webp',
	'Cocoa Beans': '/images/crops/cocoa.webp',
	Melon: '/images/crops/melon.webp',
	Mushroom: '/images/crops/mushroom.webp',
	'Nether Wart': '/images/crops/netherwart.webp',
	Potato: '/images/crops/potato.webp',
	Pumpkin: '/images/crops/pumpkin.webp',
	'Sugar Cane': '/images/crops/sugarcane.webp',
	Wheat: '/images/crops/wheat.webp',
};

export const PROPER_CROP_NAMES = Object.keys(PROPER_CROP_TO_MINION);
