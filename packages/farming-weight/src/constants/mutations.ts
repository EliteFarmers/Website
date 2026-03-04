import { Rarity } from './reforges.js';

const GREENHOUSE_MUTATION_RARITIES: Record<string, Rarity> = {
	ASHWREATH: Rarity.Common,
	BLASTBERRY: Rarity.Rare,
	CHEESEBITE: Rarity.Rare,
	CHLORONITE: Rarity.Rare,
	CINDERSHADE: Rarity.Uncommon,
	DO_NOT_EAT_SHROOM: Rarity.Rare,
	FLESHTRAP: Rarity.Rare,
	NOCTILUME: Rarity.Rare,
	PHANTOMLEAF: Rarity.Legendary,
	CHOCOBERRY: Rarity.Uncommon,
	CHORUS_FRUIT: Rarity.Epic,
	DEVOURER: Rarity.Legendary,
	GLASSCORN: Rarity.Legendary,
	LONELILY: Rarity.Common,
	PUFFERCLOUD: Rarity.Epic,
	SOGGYBUD: Rarity.Rare,
	THORNSHADE: Rarity.Uncommon,
	TURTLELLINI: Rarity.Epic,
	ALL_IN_ALOE: Rarity.Legendary,
	COALROOT: Rarity.Uncommon,
	DUSKBLOOM: Rarity.Uncommon,
	JERRYFLOWER: Rarity.Legendary,
	PLANTBOY_ADVANCE: Rarity.Epic,
	SNOOZLING: Rarity.Rare,
	STARTLEVINE: Rarity.Epic,
	THUNDERLING: Rarity.Epic,
	TIMESTALK: Rarity.Legendary,
	GODSEED: Rarity.Legendary,
	MAGIC_JELLYBEAN: Rarity.Rare,
	STOPLIGHT_PETAL: Rarity.Epic,
	ZOMBUD: Rarity.Epic,
	DUSTGRAIN: Rarity.Common,
	GLOOMGOURD: Rarity.Common,
	SHELLFRUIT: Rarity.Epic,
	SCOURROOT: Rarity.Common,
	SHADEVINE: Rarity.Common,
	CHOCONUT: Rarity.Common,
	CREAMBLOOM: Rarity.Uncommon,
	VEILSHROOM: Rarity.Common,
	WITHERBLOOM: Rarity.Common,
} as const;

export interface GreenhouseMutationRenderMapping {
	itemId?: string;
	surface?: string;
}

export const GREENHOUSE_MUTATION_RENDER_MAPPINGS: Record<string, GreenhouseMutationRenderMapping> = {
	POTATO: {
		itemId: 'POTATO_ITEM',
		surface: 'FARMLAND',
	},
	CARROT: {
		itemId: 'CARROT_ITEM',
		surface: 'FARMLAND',
	},
	SUGAR_CANE: {
		itemId: 'SUGAR_CANE',
		surface: 'DIRT',
	},
	CACTUS: {
		itemId: 'CACTUS',
		surface: 'SAND',
	},
	SUNFLOWER: {
		itemId: 'DOUBLE_PLANT',
		surface: 'FARMLAND',
	},
	FIRE: {
		itemId: 'FLINT_AND_STEEL',
		surface: 'NETHERRACK',
	},
	COCOA_BEANS: {
		itemId: 'INK_SACK:3',
		surface: 'DIRT',
	},
	DEAD_PLANT: {
		itemId: 'DEAD_PLANT',
		surface: 'DIRT',
	},
	MELON_SLICE: {
		itemId: 'MELON',
		surface: 'FARMLAND',
	},
	NETHER_WART: {
		itemId: 'NETHER_STALK',
		surface: 'SOUL_SAND',
	},
} as const;

const GREENHOUSE_MUTATIONS_BASE = getGreenhouseMutationsBase();

export const GREENHOUSE_MUTATIONS = Object.fromEntries(
	Object.entries(GREENHOUSE_MUTATIONS_BASE).map(([key, mutation]) => [
		key,
		{
			...mutation,
			rarity: GREENHOUSE_MUTATION_RARITIES[mutation.id] ?? Rarity.Common,
		},
	])
) as {
	[K in keyof typeof GREENHOUSE_MUTATIONS_BASE]: (typeof GREENHOUSE_MUTATIONS_BASE)[K] & {
		rarity: Rarity;
	};
};

export function getGreenhouseMutationRenderItemId(id: string): string {
	return GREENHOUSE_MUTATION_RENDER_MAPPINGS[id]?.itemId ?? id;
}

export function getGreenhouseMutationRenderSurface(id: string, fallbackSurface: string): string {
	return GREENHOUSE_MUTATION_RENDER_MAPPINGS[id]?.surface ?? fallbackSurface;
}

function getGreenhouseMutationsBase() {
	return {
		zombud: {
			id: 'ZOMBUD',
			type: 'MUTATION',
			display: {
				name: 'Zombud',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'SOUL_SAND',
				stages: 16,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'DEAD_PLANT',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'CINDERSHADE',
					count: 2,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'FLESHTRAP',
					count: 2,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'PUMPKIN',
					amount: 1190,
				},
				{
					item: 'WILD_ROSE',
					amount: 2800,
				},
			],
			effects: {
				EFFECT_SPREAD: {},
				BONUS_DROPS: {},
			},
		},
		godseed: {
			id: 'GODSEED',
			type: 'MUTATION',
			display: {
				name: 'Godseed',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [3, 3],
				surface: 'FARMLAND',
				stages: 40,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'EFFECT_TYPE',
					requirement: 'ALL_POSITIVE',
				},
			],
			drops: [
				{
					item: 'BROWN_MUSHROOM',
					amount: 117,
				},
				{
					item: 'COCOA_BEANS',
					amount: 492,
				},
				{
					item: 'MOONFLOWER',
					amount: 492,
				},
				{
					item: 'CARROT',
					amount: 862,
				},
				{
					item: 'SUNFLOWER',
					amount: 492,
				},
				{
					item: 'CACTUS',
					amount: 369,
				},
				{
					item: 'SUGAR_CANE',
					amount: 492,
				},
				{
					item: 'PUMPKIN',
					amount: 209,
				},
				{
					item: 'WHEAT',
					amount: 246,
				},
				{
					item: 'MELON_SLICE',
					amount: 985,
				},
				{
					item: 'POTATO',
					amount: 738,
				},
				{
					item: 'NETHER_WART',
					amount: 738,
				},
				{
					item: 'RED_MUSHROOM',
					amount: 117,
				},
				{
					item: 'WILD_ROSE',
					amount: 492,
				},
			],
			effects: {
				IMPROVED_HARVEST_BOOST: {
					value: 0.3,
				},
				IMPROVED_WATER_RETAIN: {
					value: 1,
				},
				IMPROVED_XP_BOOST: {
					value: 0.3,
				},
				IMMUNITY: {},
				BONUS_DROPS: {},
				EFFECT_SPREAD: {},
			},
		},
		choconut: {
			id: 'CHOCONUT',
			type: 'MUTATION',
			display: {
				name: 'Choconut',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 0,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'COCOA_BEANS',
					count: 2,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'COCOA_BEANS',
					amount: 400,
				},
			],
			effects: {
				IMMUNITY: {},
			},
		},
		coalroot: {
			id: 'COALROOT',
			type: 'MUTATION',
			display: {
				name: 'Coalroot',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 8,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'ASHWREATH',
					count: 5,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'SCOURROOT',
					count: 3,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'POTATO',
					amount: 600,
				},
				{
					item: 'CARROT',
					amount: 1400,
				},
				{
					item: 'NETHER_WART',
					amount: 600,
				},
			],
			effects: {
				XP_BOOST: {
					value: 0.2,
				},
			},
		},
		devourer: {
			id: 'DEVOURER',
			type: 'MUTATION',
			display: {
				name: 'Devourer',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 16,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'PUFFERCLOUD',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'ZOMBUD',
					count: 4,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'BROWN_MUSHROOM',
					amount: 950,
				},
				{
					item: 'PUMPKIN',
					amount: 1700,
				},
				{
					item: 'RED_MUSHROOM',
					amount: 950,
				},
			],
			effects: {
				IMPROVED_HARVEST_BOOST: {
					value: 0.3,
				},
				BONUS_DROPS: {},
				WATER_DRAIN: {
					value: -0.3,
				},
			},
		},
		lonelily: {
			id: 'LONELILY',
			type: 'MUTATION',
			display: {
				name: 'Lonelily',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 0,
				requiresWater: true,
			},
			drops: [
				{
					item: 'POTATO',
					amount: 600,
				},
				{
					item: 'CARROT',
					amount: 700,
				},
				{
					item: 'PUMPKIN',
					amount: 340,
				},
			],
			effects: {
				BONUS_DROPS: {},
			},
		},
		soggybud: {
			id: 'SOGGYBUD',
			type: 'MUTATION',
			display: {
				name: 'Soggybud',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 10,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'MELON',
					count: 2,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'GLOOMGOURD',
					count: 2,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'MELON_SLICE',
					amount: 3200,
				},
			],
			effects: {
				WATER_RETAIN: {
					value: 0.5,
				},
			},
		},
		ashwreath: {
			id: 'ASHWREATH',
			type: 'MUTATION',
			display: {
				name: 'Ashwreath',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'SOUL_SAND',
				stages: 0,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'NETHER_WART',
					count: 2,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'FIRE',
					count: 2,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'NETHER_WART',
					amount: 720,
				},
			],
			effects: {
				IMPROVED_HARVEST_BOOST: {
					value: 0.3,
				},
				XP_LOSS: {
					value: -0.2,
				},
			},
		},
		duskbloom: {
			id: 'DUSKBLOOM',
			type: 'MUTATION',
			display: {
				name: 'Duskbloom',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 8,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'MOONFLOWER',
					count: 2,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'SHADEVINE',
					count: 2,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'SUNFLOWER',
					count: 2,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'DUSTGRAIN',
					count: 2,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'MOONFLOWER',
					amount: 533,
				},
				{
					item: 'SUNFLOWER',
					amount: 533,
				},
				{
					item: 'WHEAT',
					amount: 267,
				},
			],
			effects: {
				BONUS_DROPS: {},
			},
		},
		dustgrain: {
			id: 'DUSTGRAIN',
			type: 'MUTATION',
			display: {
				name: 'Dustgrain',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 0,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'WHEAT',
					count: 2,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'WHEAT',
					amount: 200,
				},
			],
			effects: {
				HARVEST_BOOST: {
					value: 0.2,
				},
			},
		},
		fleshtrap: {
			id: 'FLESHTRAP',
			type: 'MUTATION',
			display: {
				name: 'Fleshtrap',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 14,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'CINDERSHADE',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'LONELILY',
					count: 4,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'POTATO',
					amount: 1200,
				},
				{
					item: 'CARROT',
					amount: 1400,
				},
				{
					item: 'PUMPKIN',
					amount: 680,
				},
			],
			effects: {
				BONUS_DROPS: {},
			},
		},
		glasscorn: {
			id: 'GLASSCORN',
			type: 'MUTATION',
			display: {
				name: 'Glasscorn',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [2, 2],
				surface: 'SAND',
				stages: 9,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'STARTLEVINE',
					count: 6,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'CHLORONITE',
					count: 6,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'POTATO',
					amount: 4800,
				},
				{
					item: 'CACTUS',
					amount: 2400,
				},
			],
			effects: {
				IMPROVED_WATER_RETAIN: {
					value: 1,
				},
				IMMUNITY: {},
				HARVEST_LOSS: {
					value: -0.2,
				},
			},
		},
		noctilume: {
			id: 'NOCTILUME',
			type: 'MUTATION',
			display: {
				name: 'Noctilume',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [2, 2],
				surface: 'FARMLAND',
				stages: 4,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'DUSKBLOOM',
					count: 6,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'LONELILY',
					count: 6,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'CACTUS',
					amount: 1200,
				},
				{
					item: 'WILD_ROSE',
					amount: 1600,
				},
			],
			effects: {
				EFFECT_SPREAD: {},
				IMPROVED_WATER_RETAIN: {
					value: 1,
				},
				HARVEST_LOSS: {
					value: -0.2,
				},
			},
		},
		scourroot: {
			id: 'SCOURROOT',
			type: 'MUTATION',
			display: {
				name: 'Scourroot',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 0,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'POTATO',
					count: 1,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'CARROT',
					count: 1,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'POTATO',
					amount: 210,
				},
				{
					item: 'CARROT',
					amount: 245,
				},
			],
			effects: {
				XP_BOOST: {
					value: 0.2,
				},
				IMMUNITY: {},
			},
		},
		shadevine: {
			id: 'SHADEVINE',
			type: 'MUTATION',
			display: {
				name: 'Shadevine',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 0,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'CACTUS',
					count: 1,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'SUGAR_CANE',
					count: 1,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'CACTUS',
					amount: 135,
				},
				{
					item: 'SUGAR_CANE',
					amount: 180,
				},
			],
			effects: {
				IMPROVED_WATER_RETAIN: {
					value: 1,
				},
				IMPROVED_XP_BOOST: {
					value: 0.3,
				},
				HARVEST_LOSS: {
					value: -0.2,
				},
			},
		},
		snoozling: {
			id: 'SNOOZLING',
			type: 'MUTATION',
			display: {
				name: 'Snoozling',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [3, 3],
				surface: 'FARMLAND',
				stages: 20,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'CREAMBLOOM',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'DUSTGRAIN',
					count: 3,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'WITHERBLOOM',
					count: 3,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'DUSKBLOOM',
					count: 3,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'THORNSHADE',
					count: 3,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'MOONFLOWER',
					amount: 800,
				},
				{
					item: 'SUNFLOWER',
					amount: 800,
				},
				{
					item: 'CACTUS',
					amount: 600,
				},
				{
					item: 'SUGAR_CANE',
					amount: 800,
				},
			],
			effects: {
				BONUS_DROPS: {},
			},
		},
		timestalk: {
			id: 'TIMESTALK',
			type: 'MUTATION',
			display: {
				name: 'Timestalk',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'END_STONE',
				stages: 14,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'STOPLIGHT_PETAL',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'CHORUS_FRUIT',
					count: 2,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'SHELLFRUIT',
					count: 2,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'CACTUS',
					amount: 3000,
				},
				{
					item: 'SUGAR_CANE',
					amount: 4000,
				},
			],
			effects: {
				IMPROVED_WATER_RETAIN: {
					value: 1,
				},
				IMPROVED_XP_BOOST: {
					value: 0.3,
				},
				HARVEST_LOSS: {
					value: -0.2,
				},
			},
		},
		blastberry: {
			id: 'BLASTBERRY',
			type: 'MUTATION',
			display: {
				name: 'Blastberry',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'SAND',
				stages: 6,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'CHOCOBERRY',
					count: 5,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'ASHWREATH',
					count: 3,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'COCOA_BEANS',
					amount: 1200,
				},
				{
					item: 'NETHER_WART',
					amount: 1800,
				},
			],
			effects: {
				IMMUNITY: {},
				IMPROVED_HARVEST_BOOST: {
					value: 0.3,
				},
				XP_LOSS: {
					value: -0.2,
				},
			},
		},
		cheesebite: {
			id: 'CHEESEBITE',
			type: 'MUTATION',
			display: {
				name: 'Cheesebite',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 10,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'CREAMBLOOM',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'FERMENTO',
					count: 4,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'BROWN_MUSHROOM',
					amount: 190,
				},
				{
					item: 'CACTUS',
					amount: 600,
				},
				{
					item: 'SUGAR_CANE',
					amount: 800,
				},
				{
					item: 'RED_MUSHROOM',
					amount: 190,
				},
			],
			effects: {
				IMPROVED_WATER_RETAIN: {
					value: 1,
				},
				HARVEST_LOSS: {
					value: -0.2,
				},
			},
		},
		chloronite: {
			id: 'CHLORONITE',
			type: 'MUTATION',
			display: {
				name: 'Chloronite',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 10,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'COALROOT',
					count: 6,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'THORNSHADE',
					count: 2,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'BROWN_MUSHROOM',
					amount: 95,
				},
				{
					item: 'POTATO',
					amount: 600,
				},
				{
					item: 'CARROT',
					amount: 700,
				},
				{
					item: 'RED_MUSHROOM',
					amount: 95,
				},
				{
					item: 'WILD_ROSE',
					amount: 400,
				},
			],
			effects: {
				IMMUNITY: {},
			},
		},
		chocoberry: {
			id: 'CHOCOBERRY',
			type: 'MUTATION',
			display: {
				name: 'Chocoberry',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 6,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'CHOCONUT',
					count: 6,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'GLOOMGOURD',
					count: 2,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'COCOA_BEANS',
					amount: 400,
				},
				{
					item: 'PUMPKIN',
					amount: 170,
				},
				{
					item: 'MELON_SLICE',
					amount: 1600,
				},
			],
			effects: {
				WATER_RETAIN: {
					value: 0.5,
				},
			},
		},
		creambloom: {
			id: 'CREAMBLOOM',
			type: 'MUTATION',
			display: {
				name: 'Creambloom',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 6,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'CHOCONUT',
					count: 8,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'COCOA_BEANS',
					amount: 1600,
				},
			],
			effects: {
				IMMUNITY: {},
			},
		},
		gloomgourd: {
			id: 'GLOOMGOURD',
			type: 'MUTATION',
			display: {
				name: 'Gloomgourd',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 0,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'PUMPKIN',
					count: 1,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'MELON',
					count: 1,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'PUMPKIN',
					amount: 60,
				},
				{
					item: 'MELON_SLICE',
					amount: 280,
				},
			],
			effects: {
				WATER_RETAIN: {
					value: 0.5,
				},
				BONUS_DROPS: {},
			},
		},
		shellfruit: {
			id: 'SHELLFRUIT',
			type: 'MUTATION',
			display: {
				name: 'Shellfruit',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 0,
				requiresWater: true,
			},
			drops: [
				{
					item: 'COCOA_BEANS',
					amount: 400,
				},
				{
					item: 'MELON_SLICE',
					amount: 800,
				},
			],
			effects: {
				WATER_RETAIN: {
					value: 0.5,
				},
				IMMUNITY: {},
			},
		},
		thornshade: {
			id: 'THORNSHADE',
			type: 'MUTATION',
			display: {
				name: 'Thornshade',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 8,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'WILD_ROSE',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'VEILSHROOM',
					count: 4,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'BROWN_MUSHROOM',
					amount: 190,
				},
				{
					item: 'RED_MUSHROOM',
					amount: 190,
				},
				{
					item: 'WILD_ROSE',
					amount: 800,
				},
			],
			effects: {
				EFFECT_SPREAD: {},
			},
		},
		veilshroom: {
			id: 'VEILSHROOM',
			type: 'MUTATION',
			display: {
				name: 'Veilshroom',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'MYCELIUM',
				stages: 0,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'RED_MUSHROOM',
					count: 1,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'BROWN_MUSHROOM',
					count: 1,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'BROWN_MUSHROOM',
					amount: 66,
				},
				{
					item: 'RED_MUSHROOM',
					amount: 66,
				},
			],
			effects: {
				IMPROVED_HARVEST_BOOST: {
					value: 0.3,
				},
				WATER_DRAIN: {
					value: -0.3,
				},
			},
		},
		all_in_aloe: {
			id: 'ALL_IN_ALOE',
			type: 'MUTATION',
			display: {
				name: 'All-in Aloe',
				minecraftId: 'minecraft:skull',
			},
			growth: {
				size: [1, 1],
				surface: 'SAND',
				stages: 27,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'MAGIC_JELLYBEAN',
					count: 6,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'PLANTBOY_ADVANCE',
					count: 2,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'MOONFLOWER',
					amount: 200,
				},
				{
					item: 'SUNFLOWER',
					amount: 200,
				},
				{
					item: 'WHEAT',
					amount: 200,
				},
			],
			effects: {
				HARVEST_BOOST: {
					value: 0.2,
				},
			},
		},
		cindershade: {
			id: 'CINDERSHADE',
			type: 'MUTATION',
			display: {
				name: 'Cindershade',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'SOUL_SAND',
				stages: 8,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'ASHWREATH',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'WITHERBLOOM',
					count: 4,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'NETHER_WART',
					amount: 1200,
				},
				{
					item: 'WILD_ROSE',
					amount: 800,
				},
			],
			effects: {
				IMPROVED_HARVEST_BOOST: {
					value: 0.3,
				},
				EFFECT_SPREAD: {},
				XP_LOSS: {
					value: -0.2,
				},
			},
		},
		jerryflower: {
			id: 'JERRYFLOWER',
			type: 'MUTATION',
			display: {
				name: 'Jerryflower',
				minecraftId: 'minecraft:skull',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 10,
				requiresWater: true,
			},
		},
		phantomleaf: {
			id: 'PHANTOMLEAF',
			type: 'MUTATION',
			display: {
				name: 'Phantomleaf',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'SOUL_SAND',
				stages: 15,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'CHORUS_FRUIT',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'SHELLFRUIT',
					count: 4,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'POTATO',
					amount: 4800,
				},
				{
					item: 'CARROT',
					amount: 5600,
				},
			],
			effects: {
				IMMUNITY: {},
				XP_BOOST: {
					value: 0.2,
				},
			},
		},
		puffercloud: {
			id: 'PUFFERCLOUD',
			type: 'MUTATION',
			display: {
				name: 'Puffercloud',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 14,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'SNOOZLING',
					count: 2,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'DO_NOT_EAT_SHROOM',
					count: 6,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'BROWN_MUSHROOM',
					amount: 665,
				},
				{
					item: 'MOONFLOWER',
					amount: 1400,
				},
				{
					item: 'SUNFLOWER',
					amount: 1400,
				},
				{
					item: 'RED_MUSHROOM',
					amount: 665,
				},
			],
			effects: {
				IMPROVED_HARVEST_BOOST: {
					value: 0.3,
				},
				WATER_DRAIN: {
					value: -0.3,
				},
			},
		},
		startlevine: {
			id: 'STARTLEVINE',
			type: 'MUTATION',
			display: {
				name: 'Startlevine',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 12,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'BLASTBERRY',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'CHEESEBITE',
					count: 4,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'CACTUS',
					amount: 1500,
				},
				{
					item: 'SUGAR_CANE',
					amount: 2000,
				},
			],
			effects: {
				IMPROVED_WATER_RETAIN: {
					value: 1,
				},
				IMPROVED_XP_BOOST: {
					value: 0.3,
				},
				HARVEST_LOSS: {
					value: -0.2,
				},
			},
		},
		thunderling: {
			id: 'THUNDERLING',
			type: 'MUTATION',
			display: {
				name: 'Thunderling',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 16,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'SOGGYBUD',
					count: 5,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'NOCTILUME',
					count: 3,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'CACTUS',
					amount: 900,
				},
				{
					item: 'MELON_SLICE',
					amount: 2400,
				},
				{
					item: 'WILD_ROSE',
					amount: 2400,
				},
			],
			effects: {
				EFFECT_SPREAD: {},
			},
		},
		turtlellini: {
			id: 'TURTLELLINI',
			type: 'MUTATION',
			display: {
				name: 'Turtlellini',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 0,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'SOGGYBUD',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'CHOCONUT',
					count: 4,
					range: 'ADJACENT',
				},
			],
			effects: {
				WATER_RETAIN: {
					value: 0.5,
				},
				IMMUNITY: {},
			},
		},
		witherbloom: {
			id: 'WITHERBLOOM',
			type: 'MUTATION',
			display: {
				name: 'Witherbloom',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'SOUL_SAND',
				stages: 0,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'DEAD_PLANT',
					count: 4,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'WILD_ROSE',
					amount: 600,
				},
			],
			effects: {
				EFFECT_SPREAD: {},
			},
		},
		chorus_fruit: {
			id: 'CHORUS_FRUIT',
			type: 'MUTATION',
			display: {
				name: 'Chorus Fruit',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'END_STONE',
				stages: 12,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'CHLORONITE',
					count: 5,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'MAGIC_JELLYBEAN',
					count: 3,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'POTATO',
					amount: 1500,
				},
				{
					item: 'CARROT',
					amount: 1750,
				},
				{
					item: 'SUGAR_CANE',
					amount: 2000,
				},
			],
			effects: {
				IMPROVED_XP_BOOST: {
					value: 0.3,
				},
				HARVEST_LOSS: {
					value: -0.2,
				},
			},
		},
		// devourer_root: {
		// 	id: 'DEVOURER',
		// 	type: 'MUTATION',
		// 	display: {
		// 		name: 'Devourer',
		// 		minecraftId: 'minecraft:player_head',
		// 	},
		// 	growth: {
		// 		size: [1, 1],
		// 		surface: 'FARMLAND',
		// 		stages: 16,
		// 		requiresWater: true,
		// 	},
		// 	spreadingConditions: [
		// 		{
		// 			type: 'CROP',
		// 			crop: 'PUFFERCLOUD',
		// 			count: 4,
		// 			range: 'ADJACENT',
		// 		},
		// 		{
		// 			type: 'CROP',
		// 			crop: 'ZOMBUD',
		// 			count: 4,
		// 			range: 'ADJACENT',
		// 		},
		// 	],
		// 	drops: [
		// 		{
		// 			item: 'BROWN_MUSHROOM',
		// 			amount: 950,
		// 		},
		// 		{
		// 			item: 'PUMPKIN',
		// 			amount: 1700,
		// 		},
		// 		{
		// 			item: 'RED_MUSHROOM',
		// 			amount: 950,
		// 		},
		// 	],
		// 	effects: {
		// 		IMPROVED_HARVEST_BOOST: {
		// 			value: 0.3,
		// 		},
		// 		BONUS_DROPS: {},
		// 		WATER_DRAIN: {
		// 			value: -0.3,
		// 		},
		// 	},
		// },
		magic_jellybean: {
			id: 'MAGIC_JELLYBEAN',
			type: 'MUTATION',
			display: {
				name: 'Magic Jellybean',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'SAND',
				stages: 120,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'SUGAR_CANE',
					count: 5,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'DUSKBLOOM',
					count: 3,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'MOONFLOWER',
					amount: 600,
				},
				{
					item: 'SUNFLOWER',
					amount: 600,
				},
				{
					item: 'SUGAR_CANE',
					amount: 1200,
				},
			],
			effects: {
				IMPROVED_XP_BOOST: {
					value: 0.3,
				},
				HARVEST_LOSS: {
					value: -0.2,
				},
			},
		},
		stoplight_petal: {
			id: 'STOPLIGHT_PETAL',
			type: 'MUTATION',
			display: {
				name: 'Stoplight Petal',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 12,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'SNOOZLING',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'NOCTILUME',
					count: 4,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'CACTUS',
					amount: 2400,
				},
				{
					item: 'WILD_ROSE',
					amount: 3200,
				},
			],
			effects: {
				EFFECT_SPREAD: {},
				IMPROVED_WATER_RETAIN: {
					value: 1,
				},
				HARVEST_LOSS: {
					value: -0.2,
				},
			},
		},
		plantboy_advance: {
			id: 'PLANTBOY_ADVANCE',
			type: 'MUTATION',
			display: {
				name: 'PlantBoy Advance',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [2, 2],
				surface: 'FARMLAND',
				stages: 12,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'SNOOZLING',
					count: 6,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'THUNDERLING',
					count: 6,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'MOONFLOWER',
					amount: 1200,
				},
				{
					item: 'SUNFLOWER',
					amount: 1200,
				},
				{
					item: 'WHEAT',
					amount: 1200,
				},
			],
			effects: {
				HARVEST_BOOST: {
					value: 0.2,
				},
			},
		},
		do_not_eat_shroom: {
			id: 'DO_NOT_EAT_SHROOM',
			type: 'MUTATION',
			display: {
				name: 'Do-not-eat-shroom',
				minecraftId: 'minecraft:player_head',
			},
			growth: {
				size: [1, 1],
				surface: 'FARMLAND',
				stages: 8,
				requiresWater: true,
			},
			spreadingConditions: [
				{
					type: 'CROP',
					crop: 'VEILSHROOM',
					count: 4,
					range: 'ADJACENT',
				},
				{
					type: 'CROP',
					crop: 'SCOURROOT',
					count: 4,
					range: 'ADJACENT',
				},
			],
			drops: [
				{
					item: 'BROWN_MUSHROOM',
					amount: 380,
				},
				{
					item: 'POTATO',
					amount: 1200,
				},
				{
					item: 'CARROT',
					amount: 1400,
				},
				{
					item: 'RED_MUSHROOM',
					amount: 380,
				},
			],
			effects: {
				IMPROVED_HARVEST_BOOST: {
					value: 0.3,
				},
				WATER_DRAIN: {
					value: -0.3,
				},
			},
		},
	} as const;
}
