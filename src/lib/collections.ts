import { building } from "$app/environment";

const backup_data: CollectionInfo = {
	name: 'Farming',
	items: {
		'INK_SACK:3': {
			name: 'Cocoa Beans',
			maxTiers: 9,
			tiers: [
				{
					tier: 1,
					amountRequired: 75,
					unlocks: ['Cocoa Beans Minion Recipes', '+4 SkyBlock XP'],
				},
				{
					tier: 2,
					amountRequired: 200,
					unlocks: ['+20 Farming Experience', '+4 SkyBlock XP'],
				},
				{
					tier: 3,
					amountRequired: 500,
					unlocks: ['Portal to Mushroom Island Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 4,
					amountRequired: 2000,
					unlocks: ['Enchanted Cocoa Bean Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 5,
					amountRequired: 5000,
					unlocks: ['Travel Scroll to Mushroom Island Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 6,
					amountRequired: 10000,
					unlocks: ['Enchanted Cookie Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 7,
					amountRequired: 20000,
					unlocks: ['Adrenaline Potion Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 8,
					amountRequired: 50000,
					unlocks: ['Enchanted Book (Replenish I) Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 9,
					amountRequired: 100000,
					unlocks: ['+10,000 Farming Experience', '+4 SkyBlock XP'],
				},
			],
		},
		CARROT_ITEM: {
			name: 'Carrot',
			maxTiers: 9,
			tiers: [
				{
					tier: 1,
					amountRequired: 100,
					unlocks: ['Carrot Minion Recipes', '+4 SkyBlock XP'],
				},
				{
					tier: 2,
					amountRequired: 250,
					unlocks: ['Simple Carrot Candy Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 3,
					amountRequired: 500,
					unlocks: ['Carrot Bait Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 4,
					amountRequired: 1750,
					unlocks: ['Enchanted Carrot Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 5,
					amountRequired: 5000,
					unlocks: ['Enchanted Carrot on a Stick Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 6,
					amountRequired: 10000,
					unlocks: ['Great Carrot Candy Recipe', 'Super Catching Egg (COMING SOON)', '+4 SkyBlock XP'],
				},
				{
					tier: 7,
					amountRequired: 25000,
					unlocks: ['Enchanted Golden Carrot Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 8,
					amountRequired: 50000,
					unlocks: ['Superb Carrot Candy Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 9,
					amountRequired: 100000,
					unlocks: ['Mega Catching Egg (COMING SOON)', '+4 SkyBlock XP'],
				},
			],
		},
		CACTUS: {
			name: 'Cactus',
			maxTiers: 9,
			tiers: [
				{
					tier: 1,
					amountRequired: 100,
					unlocks: ['Cactus Minion Recipes', '+4 SkyBlock XP'],
				},
				{
					tier: 2,
					amountRequired: 250,
					unlocks: [
						'Cactus Helmet Recipe',
						'Cactus Chestplate Recipe',
						'Cactus Leggings Recipe',
						'Cactus Boots Recipe',
						'+4 SkyBlock XP',
					],
				},
				{
					tier: 3,
					amountRequired: 500,
					unlocks: ['Resistance Potion Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 4,
					amountRequired: 1000,
					unlocks: ['Enchanted Cactus Green Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 5,
					amountRequired: 2500,
					unlocks: ['Desert Island Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 6,
					amountRequired: 5000,
					unlocks: ['Enchanted Book (Piercing I) Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 7,
					amountRequired: 10000,
					unlocks: ['Enchanted Book (Thorns II) Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 8,
					amountRequired: 25000,
					unlocks: ['Enchanted Cactus Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 9,
					amountRequired: 50000,
					unlocks: ['+5,000 Farming Experience', '+4 SkyBlock XP'],
				},
			],
		},
		SUGAR_CANE: {
			name: 'Sugar Cane',
			maxTiers: 9,
			tiers: [
				{
					tier: 1,
					amountRequired: 100,
					unlocks: ['Sugar Cane Minion Recipes', '+4 SkyBlock XP'],
				},
				{
					tier: 2,
					amountRequired: 250,
					unlocks: ['Speed Talisman Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 3,
					amountRequired: 500,
					unlocks: ['+50 Farming Experience', '+4 SkyBlock XP'],
				},
				{
					tier: 4,
					amountRequired: 1000,
					unlocks: ['Enchanted Sugar Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 5,
					amountRequired: 2000,
					unlocks: ['Enchanted Paper Recipe', 'Speed Ring Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 6,
					amountRequired: 5000,
					unlocks: ['Enchanted Bookshelf Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 7,
					amountRequired: 10000,
					unlocks: ['Random Book (COMING SOON)', '+4 SkyBlock XP'],
				},
				{
					tier: 8,
					amountRequired: 20000,
					unlocks: ['Enchanted Sugar Cane Recipe', 'Speed Artifact Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 9,
					amountRequired: 50000,
					unlocks: [
						'Speedster Helmet Recipe',
						'Speedster Chestplate Recipe',
						'Speedster Leggings Recipe',
						'Speedster Boots Recipe',
						'+4 SkyBlock XP',
					],
				},
			],
		},
		PUMPKIN: {
			name: 'Pumpkin',
			maxTiers: 11,
			tiers: [
				{
					tier: 1,
					amountRequired: 40,
					unlocks: ['Pumpkin Minion Recipes', '+4 SkyBlock XP'],
				},
				{
					tier: 2,
					amountRequired: 100,
					unlocks: [
						'Pumpkin Helmet Recipe',
						'Pumpkin Chestplate Recipe',
						'Pumpkin Leggings Recipe',
						'Pumpkin Boots Recipe',
						'+4 SkyBlock XP',
					],
				},
				{
					tier: 3,
					amountRequired: 250,
					unlocks: ['Enchanted Pumpkin Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 4,
					amountRequired: 1000,
					unlocks: ['Enchanted Book (Cubism IV) Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 5,
					amountRequired: 2500,
					unlocks: ['Training Dummy Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 6,
					amountRequired: 5000,
					unlocks: ['Farmer Orb Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 7,
					amountRequired: 10000,
					unlocks: ['Lantern Helmet Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 8,
					amountRequired: 25000,
					unlocks: ['Farm Crystal Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 9,
					amountRequired: 50000,
					unlocks: ['Farmer Boots Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 10,
					amountRequired: 100000,
					unlocks: ['Polished Pumpkin Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 11,
					amountRequired: 250000,
					unlocks: ['Rancher\u0027s Boots Recipe', '+4 SkyBlock XP'],
				},
			],
		},
		WHEAT: {
			name: 'Wheat',
			maxTiers: 11,
			tiers: [
				{
					tier: 1,
					amountRequired: 50,
					unlocks: ['Wheat Minion Recipes', '+4 SkyBlock XP'],
				},
				{
					tier: 2,
					amountRequired: 100,
					unlocks: ['Enchanted Book (Harvesting V) Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 3,
					amountRequired: 250,
					unlocks: [
						'Farm Suit Helmet Recipe',
						'Farm Suit Chestplate Recipe',
						'Farm Suit Leggings Recipe',
						'Farm Suit Boots Recipe',
						'+4 SkyBlock XP',
					],
				},
				{
					tier: 4,
					amountRequired: 500,
					unlocks: ['Farming Talisman Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 5,
					amountRequired: 1000,
					unlocks: ['Enchanted Bread Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 6,
					amountRequired: 2500,
					unlocks: ['Farming Island Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 7,
					amountRequired: 10000,
					unlocks: ['Enchanted Hay Bale Recipe', 'Small Agronomy Sack Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 8,
					amountRequired: 15000,
					unlocks: ['Medium Agronomy Sack Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 9,
					amountRequired: 25000,
					unlocks: [
						'Farm Armor Helmet Recipe',
						'Farm Armor Chestplate Recipe',
						'Farm Armor Leggings Recipe',
						'Farm Armor Boots Recipe',
						'+4 SkyBlock XP',
					],
				},
				{
					tier: 10,
					amountRequired: 50000,
					unlocks: ['Large Agronomy Sack Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 11,
					amountRequired: 100000,
					unlocks: ['Tightly-Tied Hay Bale Recipe', 'Large Enchanted Agronomy Sack Recipe', '+4 SkyBlock XP'],
				},
			],
		},
		SEEDS: {
			name: 'Seeds',
			maxTiers: 7,
			tiers: [
				{
					tier: 1,
					amountRequired: 50,
					unlocks: ['Dirt Trade', '+4 SkyBlock XP'],
				},
				{
					tier: 2,
					amountRequired: 100,
					unlocks: ['Clay Trade', '+4 SkyBlock XP'],
				},
				{
					tier: 3,
					amountRequired: 250,
					unlocks: ['Long Grass Trade', 'Enchanted Seeds Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 4,
					amountRequired: 1000,
					unlocks: ['Fern Trade', '+4 SkyBlock XP'],
				},
				{
					tier: 5,
					amountRequired: 2500,
					unlocks: ['Dead Bush Trade', '+4 SkyBlock XP'],
				},
				{
					tier: 6,
					amountRequired: 5000,
					unlocks: ['Double Tallgrass Trade', '+4 SkyBlock XP'],
				},
				{
					tier: 7,
					amountRequired: 25000,
					unlocks: ['Box of Seeds Recipe', '+4 SkyBlock XP'],
				},
			],
		},
		MUSHROOM_COLLECTION: {
			name: 'Mushroom',
			maxTiers: 9,
			tiers: [
				{
					tier: 1,
					amountRequired: 50,
					unlocks: ['Mushroom Minion Recipes', '+4 SkyBlock XP'],
				},
				{
					tier: 2,
					amountRequired: 100,
					unlocks: ['Coming Soon (COMING SOON)', '+4 SkyBlock XP'],
				},
				{
					tier: 3,
					amountRequired: 250,
					unlocks: [
						'Mushroom Helmet Recipe',
						'Mushroom Chestplate Recipe',
						'Mushroom Leggings Recipe',
						'Mushroom Boots Recipe',
						'+4 SkyBlock XP',
					],
				},
				{
					tier: 4,
					amountRequired: 1000,
					unlocks: ['Magical Mushroom Soup Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 5,
					amountRequired: 2500,
					unlocks: ['Brown Mushroom Block Recipe', 'Red Mushroom Block Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 6,
					amountRequired: 5000,
					unlocks: ['Enchanted Red Mushroom Recipe', 'Enchanted Brown Mushroom Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 7,
					amountRequired: 10000,
					unlocks: ['Night Vision Charm Recipe', 'Mystical Mushroom Soup Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 8,
					amountRequired: 25000,
					unlocks: [
						'Enchanted Brown Mushroom Block Recipe',
						'Enchanted Red Mushroom Block Recipe',
						'+4 SkyBlock XP',
					],
				},
				{
					tier: 9,
					amountRequired: 50000,
					unlocks: ['Mystery Bat Pet Recipe', '+4 SkyBlock XP'],
				},
			],
		},
		NETHER_STALK: {
			name: 'Nether Wart',
			maxTiers: 12,
			tiers: [
				{
					tier: 1,
					amountRequired: 50,
					unlocks: ['Nether Wart Minion Recipes', '+4 SkyBlock XP'],
				},
				{
					tier: 2,
					amountRequired: 100,
					unlocks: ['Small Potion Bag', '+4 SkyBlock XP'],
				},
				{
					tier: 3,
					amountRequired: 250,
					unlocks: ['Potion Affinity Talisman Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 4,
					amountRequired: 1000,
					unlocks: ['Enchanted Nether Wart Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 5,
					amountRequired: 2500,
					unlocks: ['Medium Potion Bag Upgrade (+9 slots)', '+4 SkyBlock XP'],
				},
				{
					tier: 6,
					amountRequired: 5000,
					unlocks: ['+500 Alchemy Experience', '+4 SkyBlock XP'],
				},
				{
					tier: 7,
					amountRequired: 10000,
					unlocks: ['Potion Affinity Ring Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 8,
					amountRequired: 25000,
					unlocks: ['Large Potion Bag Upgrade (+9 slots)', '+4 SkyBlock XP'],
				},
				{
					tier: 9,
					amountRequired: 50000,
					unlocks: ['Potion Affinity Artifact Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 10,
					amountRequired: 75000,
					unlocks: ['Giant Potion Bag Upgrade (+9 slots)', '+4 SkyBlock XP'],
				},
				{
					tier: 11,
					amountRequired: 100000,
					unlocks: ['Mutant Nether Wart Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 12,
					amountRequired: 250000,
					unlocks: ['Massive Potion Bag Upgrade (+9 slots)', '+4 SkyBlock XP'],
				},
			],
		},
		MELON: {
			name: 'Melon',
			maxTiers: 9,
			tiers: [
				{
					tier: 1,
					amountRequired: 250,
					unlocks: ['Melon Minion Recipes', '+4 SkyBlock XP'],
				},
				{
					tier: 2,
					amountRequired: 500,
					unlocks: ['+50 Farming Experience', '+4 SkyBlock XP'],
				},
				{
					tier: 3,
					amountRequired: 1250,
					unlocks: ['+125 Farming Experience', '+4 SkyBlock XP'],
				},
				{
					tier: 4,
					amountRequired: 5000,
					unlocks: ['Enchanted Melon Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 5,
					amountRequired: 15000,
					unlocks: ['Enchanted Glistering Melon Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 6,
					amountRequired: 25000,
					unlocks: ['Enchanted Melon Block Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 7,
					amountRequired: 50000,
					unlocks: ['+5,000 Farming Experience', '+4 SkyBlock XP'],
				},
				{
					tier: 8,
					amountRequired: 100000,
					unlocks: ['+10,000 Farming Experience', '+4 SkyBlock XP'],
				},
				{
					tier: 9,
					amountRequired: 250000,
					unlocks: [
						'Melon Helmet Recipe',
						'Melon Chestplate Recipe',
						'Melon Leggings Recipe',
						'Melon Boots Recipe',
						'+4 SkyBlock XP',
					],
				},
			],
		},
		POTATO_ITEM: {
			name: 'Potato',
			maxTiers: 9,
			tiers: [
				{
					tier: 1,
					amountRequired: 100,
					unlocks: ['Potato Minion Recipes', '+4 SkyBlock XP'],
				},
				{
					tier: 2,
					amountRequired: 200,
					unlocks: ['Portal to The Barn Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 3,
					amountRequired: 500,
					unlocks: ['Vaccine Talisman Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 4,
					amountRequired: 1750,
					unlocks: ['Enchanted Potato Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 5,
					amountRequired: 5000,
					unlocks: ['Venomous Potion Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 6,
					amountRequired: 10000,
					unlocks: ['Travel Scroll to The Barn Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 7,
					amountRequired: 25000,
					unlocks: ['Enchanted Baked Potato Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 8,
					amountRequired: 50000,
					unlocks: ['Hot Potato Book Recipe', '+4 SkyBlock XP'],
				},
				{
					tier: 9,
					amountRequired: 100000,
					unlocks: ['+10,000 Farming Experience', '+4 SkyBlock XP'],
				},
			],
		},
	},
};

const backup_crops = {
	'Cocoa Beans': [75, 200, 500, 2000, 5000, 10000, 20000, 50000, 100000],
	Carrot: [100, 250, 500, 1750, 5000, 10000, 25000, 50000, 100000],
	Cactus: [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000],
	'Raw Chicken': [50, 100, 250, 1000, 2500, 5000, 10000, 25000, 50000, 100000],
	'Sugar Cane': [100, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000],
	Pumpkin: [40, 100, 250, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000],
	Wheat: [50, 100, 250, 500, 1000, 2500, 10000, 15000, 25000, 50000, 100000],
	Seeds: [50, 100, 250, 1000, 2500, 5000],
	Mushroom: [50, 100, 250, 1000, 2500, 5000, 10000, 25000, 50000],
	'Raw Rabbit': [50, 100, 250, 1000, 2500, 5000, 10000, 25000, 50000],
	'Nether Wart': [50, 100, 250, 1000, 2500, 5000, 10000, 25000, 50000, 75000, 100000, 250000],
	Mutton: [50, 100, 250, 1000, 2500, 5000, 10000, 25000, 50000, 100000],
	Melon: [250, 500, 1250, 5000, 15000, 25000, 50000, 100000, 250000],
	Potato: [100, 200, 500, 1750, 5000, 10000, 25000, 50000, 100000],
	Leather: [50, 100, 250, 1000, 2500, 5000, 10000, 25000, 50000, 100000],
	'Raw Porkchop': [50, 100, 250, 1000, 2500, 5000, 10000, 25000, 50000],
	Feather: [50, 100, 250, 1000, 2500, 5000, 10000, 25000, 50000],
};

class FarmingCollections {
	_data: CollectionInfo;
	lastUpdated: number;
	crops: ParsedCropTiers = {};

	get data() {
		return this._data;
	}

	private set data(data: CollectionInfo) {
		this.parseData();
		this._data = data;
	}

	constructor(data: CollectionInfo, crops: ParsedCropTiers) {
		this._data = data;
		this.data = data;
		this.crops = crops;
		this.lastUpdated = Date.now();

		void this.fetchNew();
	}

	parseData() {
		for (const collection of Object.values(this._data.items)) {
			const cropName = collection.name;
			const tiers: number[] = [];

			for (const tier in collection.tiers) {
				tiers.push(collection.tiers[tier].amountRequired);
			}

			this.crops[cropName] = tiers;
		}
	}

	async fetchNew() {
		const newData = await fetchCollections();
		this.data = newData ?? this.data;
		this.lastUpdated = Date.now();
	}
}

export default new FarmingCollections(backup_data, backup_crops);

async function fetchCollections() {
	if (building) return undefined;

	console.log('Fetching farming collections...');
	const data = await fetch('https://api.hypixel.net/resources/skyblock/collections');

	if (data.status !== 200) {
		return undefined;
	}

	const json = (await data.json()) as CollectionResponse;

	if (json.success) {
		return json.collections.FARMING;
	}
}

export interface CollectionResponse {
	success: boolean;
	lastUpdated: number;
	version: string;
	collections: Collections;
}

export interface Collections {
	FARMING: CollectionInfo;
}

export interface CollectionInfo {
	name: string;
	items: Record<string, CollectionItem>;
}

export interface CollectionItem {
	name: string;
	maxTiers: number;
	tiers: Record<number, CollectionTier>;
}

export interface CollectionTier {
	tier: number;
	amountRequired: number;
	unlocks: unknown;
}

export type ParsedCropTiers = Record<string, number[]>;
