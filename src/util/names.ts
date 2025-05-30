import { Crop } from '../constants/crops.js';
import { RARITY_COLORS, Rarity } from '../constants/reforges.js';

export function getCropDisplayName(crop?: Crop | null): string {
	return (crop ? cropDisplayNames[crop] : null) ?? 'Unknown Crop';
}

export function getCropFromName(name: string) {
	const fromDisplay = displayNamesToCrop[name];
	if (fromDisplay) return fromDisplay;

	const fromShort = shortNamesToCrop[name];
	if (fromShort) return fromShort;

	const fromFull = fullNamesToCrop[name.toLowerCase().replace(/ /g, '')];
	if (fromFull) return fromFull;

	return getCropFromItemId(name);
}

export function getCropFromItemId(itemId: string) {
	return cropItemIds[itemId];
}

export function getCropFromContestKey(contestKey: string) {
	const split = contestKey.split(':');
	if (!split.length) return undefined;

	const crop = split.at(-1);
	if (!crop) return undefined;

	if (crop === '3') return Crop.CocoaBeans;

	return cropItemIds[crop];
}

export function getItemIdFromCrop(crop: Crop) {
	return itemIdsToCrop[crop];
}

export function getRarityColor(rarity: Rarity) {
	return RARITY_COLORS[rarity];
}

const cropDisplayNames: Record<Crop, string> = {
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

const displayNamesToCrop: Record<string, Crop> = {
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

const shortNamesToCrop: Record<string, Crop> = {
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

const fullNamesToCrop: Record<string, Crop> = {
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

const cropItemIds: Record<string, Crop> = {
	CACTUS: Crop.Cactus,
	CARROT_ITEM: Crop.Carrot,
	'INK_SACK:3': Crop.CocoaBeans,
	MELON: Crop.Melon,
	BROWN_MUSHROOM: Crop.Mushroom,
	RED_MUSHROOM: Crop.Mushroom,
	MUSHROOM_COLLECTION: Crop.Mushroom,
	NETHER_STALK: Crop.NetherWart,
	POTATO_ITEM: Crop.Potato,
	PUMPKIN: Crop.Pumpkin,
	SUGAR_CANE: Crop.SugarCane,
	WHEAT: Crop.Wheat,
	SEEDS: Crop.Seeds,
};

const itemIdsToCrop: Record<Crop, string> = {
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
