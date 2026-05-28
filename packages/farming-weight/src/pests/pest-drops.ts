import { CROP_INFO, Crop } from '../constants/crops.js';
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
	affectedByFortune?: boolean;
	includesPetLuck?: boolean;
}

export interface PestDropDefinition {
	pest: Pest;
	guaranteedDrops: PestGuaranteedDropDefinition[];
	rareDrops?: PestRareDropDefinition[];
	coinDrops?: number;
}

const COMMON_MATERIAL_DROPS: PestRareDropDefinition[] = [
	{ itemId: 'COMPOST', amount: 1, chance: 0.1, affectedByFortune: false },
	{ itemId: 'HONEY_JAR', amount: 1, chance: 0.1, affectedByFortune: false },
	{ itemId: 'DUNG', amount: 1, chance: 0.1, affectedByFortune: false },
	{ itemId: 'PLANT_MATTER', amount: 1, chance: 0.1, affectedByFortune: false },
	{ itemId: 'TASTY_CHEESE', amount: 1, chance: 0.1, affectedByFortune: false },
	{ itemId: 'JELLY', amount: 1, chance: 0.1, affectedByFortune: false },
	{ itemId: 'DUNG_DYE', amount: 1, chance: 0.000002, affectedByFortune: true },
];

export const PEST_DROP_DEFINITIONS: Record<Pest, PestDropDefinition> = {
	[Pest.Fly]: pestDrop(Pest.Fly, Crop.Wheat, 'ENCHANTED_WHEAT', 1, 35, [
		{ itemId: 'BEADY_EYES', amount: 1, chance: 0.015 },
		{ itemId: 'PRETTY_FLY_VINYL', amount: 1, chance: 0.02 },
		{ itemId: ITEM_IDS.EnchantedHayBale, amount: 3, chance: 0.005 },
	]),
	[Pest.Cricket]: pestDrop(Pest.Cricket, Crop.Carrot, 'ENCHANTED_CARROT', 3, 10.5, [
		{ itemId: 'CRICKET_CHOIR_VINYL', amount: 1, chance: 0.02 },
		{ itemId: ITEM_IDS.EnchantedGoldenCarrot, amount: 10, chance: 0.005 },
		{ itemId: 'CHIRPING_STEREO', amount: 1, chance: 0.005 },
	]),
	[Pest.Locust]: pestDrop(Pest.Locust, Crop.Potato, 'ENCHANTED_POTATO', 3, 10.5, [
		{ itemId: 'CICADA_SYMPHONY_VINYL', amount: 1, chance: 0.02 },
		{ itemId: ITEM_IDS.EnchantedBakedPotato, amount: 10, chance: 0.005 },
	]),
	[Pest.Rat]: pestDrop(Pest.Rat, Crop.Pumpkin, ITEM_IDS.EnchantedPumpkin, 1, 35, [
		{ itemId: 'RODENT_REVOLUTION_VINYL', amount: 1, chance: 0.02 },
		{ itemId: ITEM_IDS.PolishedPumpkin, amount: 3, chance: 0.005 },
		{ itemId: 'RAT', amount: 1, chance: 0.002, includesPetLuck: true },
	]),
	[Pest.Mosquito]: pestDrop(Pest.Mosquito, Crop.SugarCane, 'ENCHANTED_SUGAR', 2, 17.5, [
		{ itemId: 'BUZZIN_BEATS_VINYL', amount: 1, chance: 0.02 },
		{ itemId: ITEM_IDS.EnchantedSugarCane, amount: 6, chance: 0.005 },
		{ itemId: 'CLIPPED_WINGS', amount: 1, chance: 0.01 },
	]),
	[Pest.Worm]: pestDrop(Pest.Worm, Crop.Melon, 'ENCHANTED_MELON', 5, 7, [
		{ itemId: 'BOOKWORMS_FAVORITE_BOOK', amount: 1, chance: 0.02 },
		{ itemId: 'EARTHWORM_ENSEMBLE_VINYL', amount: 1, chance: 0.02 },
		{ itemId: 'ENCHANTED_MELON_BLOCK', amount: 15, chance: 0.005 },
	]),
	[Pest.Mite]: pestDrop(Pest.Mite, Crop.Cactus, 'ENCHANTED_CACTUS_GREEN', 2, 17.5, [
		{ itemId: 'DYNAMITES_VINYL', amount: 1, chance: 0.02 },
		{ itemId: ITEM_IDS.EnchantedCactus, amount: 6, chance: 0.005 },
		{ itemId: 'ATMOSPHERIC_FILTER', amount: 1, chance: 0.0025 },
	]),
	[Pest.Moth]: pestDrop(Pest.Moth, Crop.CocoaBeans, 'ENCHANTED_COCOA', 3, 12, [
		{ itemId: 'WINGS_OF_HARMONY_VINYL', amount: 1, chance: 0.02 },
		{ itemId: ITEM_IDS.EnchantedCookie, amount: 9, chance: 0.005 },
		{ itemId: 'WRIGGLING_LARVA', amount: 1, chance: 0.005 },
	]),
	[Pest.Slug]: {
		pest: Pest.Slug,
		coinDrops: 1_000,
		guaranteedDrops: [
			{
				itemId: ITEM_IDS.EnchantedRedMushroom,
				crop: Crop.Mushroom,
				baseAmount: 1,
				scalingFortune: 35,
				chance: 0.5,
			},
			{
				itemId: ITEM_IDS.EnchantedBrownMushroom,
				crop: Crop.Mushroom,
				baseAmount: 1,
				scalingFortune: 35,
				chance: 0.5,
			},
		],
		rareDrops: [
			...COMMON_MATERIAL_DROPS,
			{ itemId: 'SLOW_AND_GROOVY_VINYL', amount: 1, chance: 0.02 },
			{ itemId: ITEM_IDS.EnchantedRedMushroomBlock, amount: 3, chance: 0.0025 },
			{ itemId: ITEM_IDS.EnchantedBrownMushroomBlock, amount: 3, chance: 0.0025 },
			{ itemId: 'SLUG;3', amount: 1, chance: 0.005, includesPetLuck: true },
			{ itemId: 'SLUG;4', amount: 1, chance: 0.001, includesPetLuck: true },
		],
	},
	[Pest.Beetle]: pestDrop(Pest.Beetle, Crop.NetherWart, ITEM_IDS.EnchantedNetherWart, 3, 12, [
		{ itemId: 'NOT_JUST_A_PEST_VINYL', amount: 1, chance: 0.02 },
		{ itemId: ITEM_IDS.MutantNetherWart, amount: 9, chance: 0.005 },
	]),
	[Pest.Dragonfly]: pestDrop(Pest.Dragonfly, Crop.Sunflower, 'ENCHANTED_SUNFLOWER', 2, 17.5, [
		{ itemId: 'IMAGINE_DRAGONFLIES_VINYL', amount: 1, chance: 0.02 },
		{ itemId: ITEM_IDS.VerminVaporizerChip, amount: 1, chance: 0.01 },
		{ itemId: 'COMPACTED_SUNFLOWER', amount: 6, chance: 0.005 },
	]),
	[Pest.Firefly]: pestDrop(Pest.Firefly, Crop.Moonflower, 'ENCHANTED_MOONFLOWER', 2, 17.5, [
		{ itemId: 'FIREFLY_IN_THE_HOLE_VINYL', amount: 1, chance: 0.02 },
		{ itemId: 'FIRE_IN_A_BOTTLE', amount: 1, chance: 0.01 },
		{ itemId: 'COMPACTED_MOONFLOWER', amount: 6, chance: 0.005 },
	]),
	[Pest.Mantis]: pestDrop(Pest.Mantis, Crop.WildRose, 'ENCHANTED_WILD_ROSE', 2, 17.5, [
		{ itemId: 'PRAY_FOR_ME_VINYL', amount: 1, chance: 0.02 },
		{ itemId: 'MANTID_CLAW', amount: 1, chance: 0.01 },
		{ itemId: 'COMPACTED_WILD_ROSE', amount: 6, chance: 0.005 },
	]),
	[Pest.Mouse]: {
		pest: Pest.Mouse,
		coinDrops: 10_000,
		guaranteedDrops: [
			{ itemId: 'ENCHANTED_WHEAT', crop: Crop.Wheat, baseAmount: 1.5, scalingFortune: 35, chance: 1 / 14 },
			{ itemId: 'ENCHANTED_CARROT', crop: Crop.Carrot, baseAmount: 4.5, scalingFortune: 10.5, chance: 1 / 14 },
			{ itemId: 'ENCHANTED_POTATO', crop: Crop.Potato, baseAmount: 4.5, scalingFortune: 10.5, chance: 1 / 14 },
			{
				itemId: ITEM_IDS.EnchantedPumpkin,
				crop: Crop.Pumpkin,
				baseAmount: 1.5,
				scalingFortune: 35,
				chance: 1 / 14,
			},
			{ itemId: 'ENCHANTED_SUGAR', crop: Crop.SugarCane, baseAmount: 3, scalingFortune: 17.5, chance: 1 / 14 },
			{ itemId: 'ENCHANTED_MELON', crop: Crop.Melon, baseAmount: 7.5, scalingFortune: 7, chance: 1 / 14 },
			{
				itemId: 'ENCHANTED_CACTUS_GREEN',
				crop: Crop.Cactus,
				baseAmount: 3,
				scalingFortune: 17.5,
				chance: 1 / 14,
			},
			{ itemId: 'ENCHANTED_COCOA', crop: Crop.CocoaBeans, baseAmount: 4.5, scalingFortune: 12, chance: 1 / 14 },
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
			{ itemId: 'ENCHANTED_WILD_ROSE', crop: Crop.WildRose, baseAmount: 3, scalingFortune: 17.5, chance: 1 / 14 },
		],
		rareDrops: [
			{ itemId: 'COMPOST', amount: 1, chance: 1, affectedByFortune: false },
			{ itemId: 'HONEY_JAR', amount: 1, chance: 1, affectedByFortune: false },
			{ itemId: 'DUNG', amount: 1, chance: 1, affectedByFortune: false },
			{ itemId: 'PLANT_MATTER', amount: 1, chance: 1, affectedByFortune: false },
			{ itemId: 'TASTY_CHEESE', amount: 1, chance: 1, affectedByFortune: false },
			{ itemId: 'JELLY', amount: 1, chance: 1, affectedByFortune: false },
			{ itemId: 'DUNG_DYE', amount: 1, chance: 0.000002, affectedByFortune: true },
			{ itemId: 'SQUEAKY_TOY', amount: 1, chance: 0.025 },
			{ itemId: 'SQUEAKY_MOUSEMAT', amount: 1, chance: 0.005 },
		],
	},
	[Pest.LunarMoth]: pestDrop(Pest.LunarMoth, Crop.Moonflower, 'ENCHANTED_MOONFLOWER', 2, 17.5, []),
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
		guaranteedDrops: [{ itemId, crop, baseAmount, scalingFortune }],
		rareDrops: [...COMMON_MATERIAL_DROPS, ...rareDrops],
	};
}
