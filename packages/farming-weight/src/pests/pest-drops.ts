import { CROP_INFO, Crop, HARVEST_FEAST_MATERIALS } from '../constants/crops.js';
import { ITEM_IDS } from '../constants/itemids.js';
import { CROP_TO_PEST, PEST_TO_CROP, Pest } from '../constants/pests.js';
import type { FarmingPlayer } from '../player/player.js';

export interface PestGuaranteedDropDefinition {
	itemId: string;
	crop: Crop;
	baseAmount: number;
	scalingFortune: number;
	chance?: number;
}

export interface PestRareDropDefinition {
	itemId: string;
	amount: number;
	chance: number;
	includesPetLuck?: boolean;
}

export interface PestFeastRareDropDefinition extends PestRareDropDefinition {
	crop: Crop;
}

export interface PestDropDefinition {
	pest: Pest;
	guaranteedDrops: PestGuaranteedDropDefinition[];
	rareDrops?: PestRareDropDefinition[];
	feastRareDrop?: PestFeastRareDropDefinition;
	coinDrops?: number;
}

const COMMON_MATERIAL_DROPS: PestRareDropDefinition[] = [
	{ itemId: 'COMPOST', amount: 1, chance: 0.1 },
	{ itemId: 'HONEY_JAR', amount: 1, chance: 0.1 },
	{ itemId: 'DUNG', amount: 1, chance: 0.1 },
	{ itemId: 'PLANT_MATTER', amount: 1, chance: 0.1 },
	{ itemId: 'CHEESE_FUEL', amount: 1, chance: 0.1 },
	{ itemId: 'JELLY', amount: 1, chance: 0.1 },
	{ itemId: 'DYE_DUNG', amount: 1, chance: 0.000004 },
];

export const PEST_DROP_DEFINITIONS: Record<Pest, PestDropDefinition> = {
	[Pest.Fly]: pestDrop(Pest.Fly, Crop.Wheat, 'ENCHANTED_WHEAT', 1, 52.5, [
		{ itemId: 'BEADY_EYES', amount: 1, chance: 0.03 },
		{ itemId: 'VINYL_PRETTY_FLY', amount: 1, chance: 0.05 },
		{ itemId: ITEM_IDS.EnchantedHayBale, amount: 3, chance: 0.0075 },
	]),
	[Pest.Cricket]: pestDrop(Pest.Cricket, Crop.Carrot, 'ENCHANTED_CARROT', 3, 15.75, [
		{ itemId: 'VINYL_CRICKET_CHOIR', amount: 1, chance: 0.05 },
		{ itemId: ITEM_IDS.EnchantedGoldenCarrot, amount: 10, chance: 0.0075 },
		{ itemId: 'CHIRPING_STEREO', amount: 1, chance: 0.01 },
	]),
	[Pest.Locust]: pestDrop(Pest.Locust, Crop.Potato, 'ENCHANTED_POTATO', 3, 15.75, [
		{ itemId: 'VINYL_CICADA_SYMPHONY', amount: 1, chance: 0.05 },
		{ itemId: 'LOCUST_LARVA', amount: 1, chance: 0.04 },
		{ itemId: ITEM_IDS.EnchantedBakedPotato, amount: 10, chance: 0.0075 },
	]),
	[Pest.Rat]: pestDrop(Pest.Rat, Crop.Pumpkin, ITEM_IDS.EnchantedPumpkin, 1, 52.5, [
		{ itemId: 'VINYL_RODENT_REVOLUTION', amount: 1, chance: 0.05 },
		{ itemId: ITEM_IDS.PolishedPumpkin, amount: 3, chance: 0.0075 },
		{ itemId: 'RAT', amount: 1, chance: 0.004, includesPetLuck: true },
	]),
	[Pest.Mosquito]: pestDrop(Pest.Mosquito, Crop.SugarCane, 'ENCHANTED_SUGAR', 2, 26.25, [
		{ itemId: 'VINYL_BUZZIN_BEATS', amount: 1, chance: 0.05 },
		{ itemId: ITEM_IDS.EnchantedSugarCane, amount: 6, chance: 0.0075 },
		{ itemId: 'CLIPPED_WINGS', amount: 1, chance: 0.02 },
	]),
	[Pest.Worm]: pestDrop(Pest.Worm, Crop.Melon, 'ENCHANTED_MELON', 5, 10.5, [
		{ itemId: 'BOOKWORMS_FAVORITE_BOOK', amount: 1, chance: 0.04 },
		{ itemId: 'VINYL_EARTHWORM_ENSEMBLE', amount: 1, chance: 0.05 },
		{ itemId: 'ENCHANTED_MELON_BLOCK', amount: 15, chance: 0.0075 },
	]),
	[Pest.Mite]: pestDrop(Pest.Mite, Crop.Cactus, 'ENCHANTED_CACTUS_GREEN', 2, 26.25, [
		{ itemId: 'VINYL_DYNAMITES', amount: 1, chance: 0.05 },
		{ itemId: ITEM_IDS.EnchantedCactus, amount: 6, chance: 0.0075 },
		{ itemId: 'ATMOSPHERIC_FILTER', amount: 1, chance: 0.005 },
	]),
	[Pest.Moth]: pestDrop(Pest.Moth, Crop.CocoaBeans, 'ENCHANTED_COCOA', 3, 18, [
		{ itemId: 'VINYL_WINGS_OF_HARMONY', amount: 1, chance: 0.05 },
		{ itemId: ITEM_IDS.EnchantedCookie, amount: 9, chance: 0.0075 },
		{ itemId: 'WRIGGLING_LARVA', amount: 1, chance: 0.01 },
	]),
	[Pest.Slug]: {
		pest: Pest.Slug,
		coinDrops: 1_000,
		guaranteedDrops: [
			{
				itemId: ITEM_IDS.EnchantedRedMushroom,
				crop: Crop.Mushroom,
				baseAmount: 1,
				scalingFortune: 52.5,
				chance: 0.5,
			},
			{
				itemId: ITEM_IDS.EnchantedBrownMushroom,
				crop: Crop.Mushroom,
				baseAmount: 1,
				scalingFortune: 52.5,
				chance: 0.5,
			},
		],
		rareDrops: [
			...COMMON_MATERIAL_DROPS,
			{ itemId: 'VINYL_SLOW_AND_GROOVY', amount: 1, chance: 0.05 },
			{ itemId: ITEM_IDS.EnchantedRedMushroomBlock, amount: 3, chance: 0.00375 },
			{
				itemId: ITEM_IDS.EnchantedBrownMushroomBlock,
				amount: 3,
				chance: 0.00375,
			},
			{ itemId: 'SLUG;3', amount: 1, chance: 0.01, includesPetLuck: true },
			{ itemId: 'SLUG;4', amount: 1, chance: 0.002, includesPetLuck: true },
		],
		feastRareDrop: feastRareDrop(Crop.Mushroom),
	},
	[Pest.Beetle]: pestDrop(Pest.Beetle, Crop.NetherWart, ITEM_IDS.EnchantedNetherWart, 3, 18, [
		{ itemId: 'ENCHANTMENT_PESTERMINATOR_1', amount: 1, chance: 0.07 },
		{ itemId: 'VINYL_NOT_JUST_A_PEST', amount: 1, chance: 0.05 },
		{ itemId: ITEM_IDS.MutantNetherWart, amount: 9, chance: 0.0075 },
	]),
	[Pest.Dragonfly]: pestDrop(Pest.Dragonfly, Crop.Sunflower, 'ENCHANTED_SUNFLOWER', 2, 26.25, [
		{ itemId: 'VINYL_IMAGINE_DRAGONFLIES', amount: 1, chance: 0.05 },
		{ itemId: ITEM_IDS.VerminVaporizerChip, amount: 1, chance: 0.02 },
		{ itemId: 'COMPACTED_SUNFLOWER', amount: 6, chance: 0.0075 },
	]),
	[Pest.Firefly]: pestDrop(Pest.Firefly, Crop.Moonflower, 'ENCHANTED_MOONFLOWER', 2, 26.25, [
		{ itemId: 'VINYL_FIREFLY_IN_THE_HOLE', amount: 1, chance: 0.05 },
		{ itemId: 'FIRE_IN_A_BOTTLE', amount: 1, chance: 0.02 },
		{ itemId: 'COMPACTED_MOONFLOWER', amount: 6, chance: 0.0075 },
	]),
	[Pest.Mantis]: pestDrop(Pest.Mantis, Crop.WildRose, 'ENCHANTED_WILD_ROSE', 2, 26.25, [
		{ itemId: 'VINYL_PRAY_FOR_ME', amount: 1, chance: 0.05 },
		{ itemId: 'MANTID_CLAW', amount: 1, chance: 0.02 },
		{ itemId: 'COMPACTED_WILD_ROSE', amount: 6, chance: 0.0075 },
	]),
	[Pest.Mouse]: {
		pest: Pest.Mouse,
		coinDrops: 10_000,
		guaranteedDrops: [
			{
				itemId: 'ENCHANTED_WHEAT',
				crop: Crop.Wheat,
				baseAmount: 1.5,
				scalingFortune: 35,
				chance: 1 / 14,
			},
			{
				itemId: 'ENCHANTED_CARROT',
				crop: Crop.Carrot,
				baseAmount: 4.5,
				scalingFortune: 10.5,
				chance: 1 / 14,
			},
			{
				itemId: 'ENCHANTED_POTATO',
				crop: Crop.Potato,
				baseAmount: 4.5,
				scalingFortune: 10.5,
				chance: 1 / 14,
			},
			{
				itemId: ITEM_IDS.EnchantedPumpkin,
				crop: Crop.Pumpkin,
				baseAmount: 1.5,
				scalingFortune: 35,
				chance: 1 / 14,
			},
			{
				itemId: 'ENCHANTED_SUGAR',
				crop: Crop.SugarCane,
				baseAmount: 3,
				scalingFortune: 17.5,
				chance: 1 / 14,
			},
			{
				itemId: 'ENCHANTED_MELON',
				crop: Crop.Melon,
				baseAmount: 7.5,
				scalingFortune: 7,
				chance: 1 / 14,
			},
			{
				itemId: 'ENCHANTED_CACTUS_GREEN',
				crop: Crop.Cactus,
				baseAmount: 3,
				scalingFortune: 17.5,
				chance: 1 / 14,
			},
			{
				itemId: 'ENCHANTED_COCOA',
				crop: Crop.CocoaBeans,
				baseAmount: 4.5,
				scalingFortune: 12,
				chance: 1 / 14,
			},
			{
				itemId: ITEM_IDS.EnchantedRedMushroom,
				crop: Crop.Mushroom,
				baseAmount: 1.5,
				scalingFortune: 35,
				chance: 1 / 14,
			},
			{
				itemId: ITEM_IDS.EnchantedBrownMushroom,
				crop: Crop.Mushroom,
				baseAmount: 1.5,
				scalingFortune: 35,
				chance: 1 / 14,
			},
			{
				itemId: ITEM_IDS.EnchantedNetherWart,
				crop: Crop.NetherWart,
				baseAmount: 4.5,
				scalingFortune: 12,
				chance: 1 / 14,
			},
			{
				itemId: 'ENCHANTED_MOONFLOWER',
				crop: Crop.Moonflower,
				baseAmount: 3,
				scalingFortune: 17.5,
				chance: 1 / 14,
			},
			{
				itemId: 'ENCHANTED_SUNFLOWER',
				crop: Crop.Sunflower,
				baseAmount: 3,
				scalingFortune: 17.5,
				chance: 1 / 14,
			},
			{
				itemId: 'ENCHANTED_WILD_ROSE',
				crop: Crop.WildRose,
				baseAmount: 3,
				scalingFortune: 17.5,
				chance: 1 / 14,
			},
		],
		rareDrops: [
			{ itemId: 'COMPOST', amount: 1, chance: 1 },
			{ itemId: 'HONEY_JAR', amount: 1, chance: 1 },
			{ itemId: 'DUNG', amount: 1, chance: 1 },
			{
				itemId: 'PLANT_MATTER',
				amount: 1,
				chance: 1,
			},
			{ itemId: 'CHEESE_FUEL', amount: 1, chance: 1 },
			{ itemId: 'JELLY', amount: 1, chance: 1 },
			{
				itemId: 'DYE_DUNG',
				amount: 1,
				chance: 0.00002,
			},
			{ itemId: 'SQUEAKY_TOY', amount: 1, chance: 0.05 },
			{ itemId: 'SQUEAKY_MOUSEMAT', amount: 1, chance: 0.01 },
		],
	},
	[Pest.LunarMoth]: {
		pest: Pest.LunarMoth,
		coinDrops: 1_000,
		guaranteedDrops: [
			guaranteedDrop(Crop.Sunflower, 'ENCHANTED_SUNFLOWER', 2, 26.25),
			guaranteedDrop(Crop.Moonflower, 'ENCHANTED_MOONFLOWER', 2, 26.25),
			guaranteedDrop(Crop.WildRose, 'ENCHANTED_WILD_ROSE', 2, 26.25),
		],
		rareDrops: [
			...COMMON_MATERIAL_DROPS,
			{ itemId: 'ENCHANTMENT_ULTIMATE_SUNSET_1', amount: 1, chance: 0.35 },
			{ itemId: 'DYE_DUNG', amount: 1, chance: 0.00002 },
		],
	},
};

export const NATURAL_PESTS: Pest[] = [
	Pest.Fly,
	Pest.Cricket,
	Pest.Locust,
	Pest.Rat,
	Pest.Mosquito,
	Pest.Worm,
	Pest.Mite,
	Pest.Moth,
	Pest.Slug,
	Pest.Beetle,
	Pest.Dragonfly,
	Pest.Firefly,
	Pest.Mantis,
];

export function calculatePestCropDropAmount(options: {
	baseAmount: number;
	scalingFortune: number;
	farmingFortune: number;
	cropFortune: number;
	pestKillFortune: number;
	includeCropFortune?: boolean;
}): number {
	const fortune =
		options.farmingFortune +
		(options.includeCropFortune === false ? 0 : options.cropFortune) +
		options.pestKillFortune;
	return options.baseAmount + fortune / options.scalingFortune;
}

export function getAssociatedCropFortune(player: FarmingPlayer, crop: Crop): number {
	const cropStat = CROP_INFO[crop]?.fortuneType;
	if (!cropStat) return 0;

	const breakdown = player.getStatBreakdown(cropStat, crop);
	return Object.values(breakdown)
		.filter((entry) => entry.stat === cropStat)
		.reduce((sum, entry) => sum + entry.value, 0);
}

export function getPestForCrop(crop: Crop): Pest | undefined {
	return CROP_TO_PEST[crop];
}

export function getCropForPest(pest: Pest): Crop | undefined {
	return PEST_TO_CROP[pest];
}

function pestDrop(
	pest: Pest,
	crop: Crop,
	itemId: string,
	baseAmount: number,
	scalingFortune: number,
	rareDrops: PestRareDropDefinition[]
): PestDropDefinition {
	return {
		pest,
		coinDrops: 1_000,
		guaranteedDrops: [guaranteedDrop(crop, itemId, baseAmount, scalingFortune)],
		rareDrops: [...COMMON_MATERIAL_DROPS, ...rareDrops],
		feastRareDrop: feastRareDrop(crop),
	};
}

function guaranteedDrop(
	crop: Crop,
	itemId: string,
	baseAmount: number,
	scalingFortune: number
): PestGuaranteedDropDefinition {
	return { itemId, crop, baseAmount, scalingFortune };
}

function feastRareDrop(crop: Crop): PestFeastRareDropDefinition {
	const itemId = HARVEST_FEAST_MATERIALS[crop];
	if (!itemId) throw new Error(`Missing Harvest Feast material for ${crop}`);
	return { crop, itemId, amount: 1, chance: 0.15 };
}
