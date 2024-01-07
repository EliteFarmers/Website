import { Crop } from '../constants/crops';

export function CropDisplayName(crop: Crop) {
	return CROP_DISPLAY_NAMES[crop] ?? 'Unknown Crop';
}

export function CropFromName(name: string) {
	const fromDisplay = DISPLAY_NAMES_TO_CROP[name];
	if (fromDisplay) return fromDisplay;

	const fromShort = SHORT_NAMES_TO_CROP[name];
	if (fromShort) return fromShort;

	const fromFull = FULL_NAMES_TO_CROP[name.toLowerCase().replace(/ /g, '')];
	if (fromFull) return fromFull;

	return CropFromItemId(name);
}

export function CropFromItemId(itemId: string) {
	return CROP_ITEM_IDS[itemId];
}

export function ItemIdFromCrop(crop: Crop) {
	return ITEM_IDS_TO_CROP[crop];
}

const CROP_DISPLAY_NAMES: Record<Crop, string> = {
	[Crop.Cactus]: 'Cactus',
	[Crop.Carrot]: 'Carrot',
	[Crop.CocoaBeans]: 'Cocoa Beans',
	[Crop.Melon]: 'Melon',
	[Crop.Mushroom]: 'Mushroom',
	[Crop.NetherWart]: 'Nether Wart',
	[Crop.Potato]: 'Potato',
	[Crop.Pumpkin]: 'Pumpkin',
	[Crop.SugarCane]: 'Sugar Cane',
	[Crop.Wheat]: 'Wheat',
	[Crop.Seeds]: 'Seeds',
};

const DISPLAY_NAMES_TO_CROP: Record<string, Crop> = {
	Cactus: Crop.Cactus,
	Carrot: Crop.Carrot,
	'Cocoa Beans': Crop.CocoaBeans,
	Melon: Crop.Melon,
	Mushroom: Crop.Mushroom,
	'Nether Wart': Crop.NetherWart,
	Potato: Crop.Potato,
	Pumpkin: Crop.Pumpkin,
	'Sugar Cane': Crop.SugarCane,
	Wheat: Crop.Wheat,
	Seeds: Crop.Seeds,
};

const SHORT_NAMES_TO_CROP: Record<string, Crop> = {
	cactus: Crop.Cactus,
	carrot: Crop.Carrot,
	cocoa: Crop.CocoaBeans,
	melon: Crop.Melon,
	mushroom: Crop.Mushroom,
	wart: Crop.NetherWart,
	potato: Crop.Potato,
	pumpkin: Crop.Pumpkin,
	cane: Crop.SugarCane,
	wheat: Crop.Wheat,
	seeds: Crop.Seeds,
};

const FULL_NAMES_TO_CROP: Record<string, Crop> = {
	cactus: Crop.Cactus,
	carrot: Crop.Carrot,
	cocoabeans: Crop.CocoaBeans,
	cocoabean: Crop.CocoaBeans,
	melon: Crop.Melon,
	mushroom: Crop.Mushroom,
	netherwart: Crop.NetherWart,
	netherwarts: Crop.NetherWart,
	potato: Crop.Potato,
	pumpkin: Crop.Pumpkin,
	sugarcane: Crop.SugarCane,
	wheat: Crop.Wheat,
	seeds: Crop.Seeds,
};

const CROP_ITEM_IDS: Record<string, Crop> = {
	CACTUS: Crop.Cactus,
	CARROT_ITEM: Crop.Carrot,
	'INK_SACK:3': Crop.CocoaBeans,
	MELON: Crop.Melon,
	BROWN_MUSHROOM: Crop.Mushroom,
	NETHER_STALK: Crop.NetherWart,
	POTATO_ITEM: Crop.Potato,
	PUMPKIN: Crop.Pumpkin,
	SUGAR_CANE: Crop.SugarCane,
	WHEAT: Crop.Wheat,
	SEEDS: Crop.Seeds,
};

const ITEM_IDS_TO_CROP: Record<Crop, string> = {
	[Crop.Cactus]: 'CACTUS',
	[Crop.Carrot]: 'CARROT_ITEM',
	[Crop.CocoaBeans]: 'INK_SACK:3',
	[Crop.Melon]: 'MELON',
	[Crop.Mushroom]: 'BROWN_MUSHROOM',
	[Crop.NetherWart]: 'NETHER_STALK',
	[Crop.Potato]: 'POTATO_ITEM',
	[Crop.Pumpkin]: 'PUMPKIN',
	[Crop.SugarCane]: 'SUGAR_CANE',
	[Crop.Wheat]: 'WHEAT',
	[Crop.Seeds]: 'SEEDS',
};
