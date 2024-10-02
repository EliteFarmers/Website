import { Crop } from './crops.js';
import { Rarity } from './reforges.js';

export const GARDEN_EXP_REQUIRED = [
	0, 70, 70, 140, 240, 600, 1500, 2000, 2500, 3000, 10000, 10000, 10000, 10000, 10000,
];

export const CROP_MILESTONES: Record<Crop, number[]> = {
	[Crop.Wheat]: [
		30, 50, 80, 170, 330, 670, 1330, 2500, 3500, 5000, 6500, 8000, 10000, 20000, 35000, 50000, 75000, 100000,
		175000, 250000, 350000, 500000, 750000, 1000000, 1300000, 1600000, 2000000, 2300000, 2600000, 3000000, 3000000,
		3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000,
		3000000, 3000000, 3000000,
	],
	[Crop.Carrot]: [
		100, 150, 250, 500, 1500, 2500, 5000, 7500, 10000, 15000, 20000, 25000, 40000, 70000, 100000, 200000, 250000,
		250000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000,
		9000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000,
		10000000, 10000000, 10000000, 10000000, 10000000, 10000000,
	],
	[Crop.Potato]: [
		100, 150, 250, 500, 1500, 2500, 5000, 7500, 10000, 15000, 20000, 25000, 40000, 70000, 100000, 200000, 250000,
		250000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000,
		9000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000,
		10000000, 10000000, 10000000, 10000000, 10000000, 10000000,
	],
	[Crop.Melon]: [
		150, 250, 400, 850, 1650, 3350, 6650, 12500, 17500, 25000, 32500, 40000, 50000, 100000, 175000, 250000, 375000,
		500000, 875000, 1250000, 1750000, 2500000, 3750000, 5000000, 6500000, 8000000, 10000000, 11500000, 13000000,
		15000000, 15000000, 15000000, 15000000, 15000000, 15000000, 15000000, 15000000, 15000000, 15000000, 15000000,
		15000000, 15000000, 15000000, 15000000, 15000000, 15000000,
	],
	[Crop.Pumpkin]: [
		30, 50, 80, 170, 330, 670, 1330, 2500, 3500, 5000, 6500, 8000, 10000, 20000, 35000, 50000, 75000, 100000,
		175000, 250000, 350000, 500000, 750000, 1000000, 1300000, 1600000, 2000000, 2300000, 2600000, 3000000, 3000000,
		3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000,
		3000000, 3000000, 3000000,
	],
	[Crop.SugarCane]: [
		60, 100, 160, 340, 660, 1340, 2660, 5000, 7000, 10000, 13000, 16000, 20000, 40000, 70000, 100000, 150000,
		200000, 350000, 500000, 700000, 1000000, 1500000, 2000000, 2600000, 3200000, 4000000, 4600000, 5200000, 6000000,
		6000000, 6000000, 6000000, 6000000, 6000000, 6000000, 6000000, 6000000, 6000000, 6000000, 6000000, 6000000,
		6000000, 6000000, 6000000, 6000000,
	],
	[Crop.CocoaBeans]: [
		90, 150, 250, 500, 1000, 2000, 4000, 7500, 10000, 15000, 20000, 25000, 30000, 50000, 100000, 150000, 200000,
		300000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000,
		9000000, 9000000, 9000000, 9000000, 9000000, 9000000, 9000000, 9000000, 9000000, 9000000, 9000000, 9000000,
		9000000, 9000000, 9000000, 9000000, 9000000,
	],
	[Crop.Cactus]: [
		60, 100, 160, 340, 660, 1340, 2660, 5000, 7000, 10000, 13000, 16000, 20000, 40000, 70000, 100000, 150000,
		200000, 350000, 500000, 700000, 1000000, 1500000, 2000000, 2600000, 3200000, 4000000, 4600000, 5200000, 6000000,
		6000000, 6000000, 6000000, 6000000, 6000000, 6000000, 6000000, 6000000, 6000000, 6000000, 6000000, 6000000,
		6000000, 6000000, 6000000, 6000000,
	],
	[Crop.Mushroom]: [
		30, 50, 80, 170, 330, 670, 1330, 2500, 3500, 5000, 6500, 8000, 10000, 20000, 35000, 50000, 75000, 100000,
		175000, 250000, 350000, 500000, 750000, 1000000, 1300000, 1600000, 2000000, 2300000, 2600000, 3000000, 3000000,
		3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000,
		3000000, 3000000, 3000000,
	],
	[Crop.NetherWart]: [
		90, 150, 250, 500, 1000, 2000, 4000, 7500, 10000, 15000, 20000, 25000, 30000, 50000, 100000, 150000, 200000,
		300000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000,
		9000000, 9000000, 9000000, 9000000, 9000000, 9000000, 9000000, 9000000, 9000000, 9000000, 9000000, 9000000,
		9000000, 9000000, 9000000, 9000000, 9000000,
	],
	[Crop.Seeds]: [],
};

export interface GardenVisitor {
	name: string;
	short?: string;
	rarity: Rarity;
	wiki: string;
}

export const GARDEN_VISITORS: Partial<Record<string, GardenVisitor>> = {
	adventurer: {
		name: 'Adventurer',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Adventurer',
	},
	alchemist: {
		name: 'Alchemist',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Alchemist',
	},
	andrew: {
		name: 'Andrew',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Andrew',
	},
	anita: {
		name: 'Anita',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Anita',
	},
	arthur: {
		name: 'Arthur',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Arthur',
	},
	baker: {
		name: 'Baker',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Baker',
	},
	banker_broadjaw: {
		name: 'Banker Broadjaw',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Banker_Broadjaw',
	},
	bartender: {
		name: 'Bartender',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Bartender',
	},
	beth: {
		name: 'Beth',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Beth',
	},
	seraphine: {
		name: 'Clerk Seraphine',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Clerk_Seraphine',
	},
	dalbrek: {
		name: 'Dalbrek',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Dalbrek',
	},
	duke: {
		name: 'Duke',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Duke',
	},
	dusk: {
		name: 'Dusk',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Dusk',
	},
	emissary_carlton: {
		name: 'Emissary Carlton',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Emissary_Carlton',
	},
	emissary_ceanna: {
		name: 'Emissary Ceanna',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Emissary_Ceanna',
	},
	emissary_fraiser: {
		name: 'Emissary Fraiser',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Emissary_Fraiser',
	},
	emissary_sisko: {
		name: 'Emissary Sisko',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Emissary_Sisko',
	},
	emissary_wilson: {
		name: 'Emissary Wilson',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Emissary_Wilson',
	},
	farmer_jon: {
		name: 'Farmer Jon',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Farmer_Jon',
	},
	farmhand: {
		name: 'Farmhand',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Farmhand',
	},
	fear_mongerer: {
		name: 'Fear Mongerer',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Fear_Mongerer',
	},
	felix: {
		name: 'Felix',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Felix',
	},
	fisherman: {
		name: 'Fisherman',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Fisherman',
	},
	fragilis: {
		name: 'Fragilis',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Fragilis',
	},
	friendly_hiker: {
		name: 'Friendly Hiker',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Friendly_Hiker',
	},
	geonathan_greatforge: {
		name: 'Geonathan Greatforge',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Geonathan_Greatforge',
	},
	gimley: {
		name: 'Gimley',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Gimley',
	},
	gold_forger: {
		name: 'Gold Forger',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Gold_Forger',
	},
	grandma_wolf: {
		name: 'Grandma Wolf',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Grandma_Wolf',
	},
	guy: {
		name: 'Guy',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Guy',
	},
	gwendolyn: {
		name: 'Gwendolyn',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Gwendolyn',
	},
	hornum: {
		name: 'Hornum',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Hornum',
	},
	hungry_hiker: {
		name: 'Hungry Hiker',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Hungry_Hiker',
	},
	iron_forger: {
		name: 'Iron Forger',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Iron_Forger',
	},
	jack: {
		name: 'Jack',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Jack',
	},
	jacob: {
		name: 'Jacob',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Jacob',
	},
	jamie: {
		name: 'Jamie',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Jamie',
	},
	jerry: {
		name: 'Jerry',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Jerry',
	},
	jotraeline_greatforge: {
		name: 'Jotraeline Greatforge',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Jotraeline_Greatforge',
	},
	lazy_miner: {
		name: 'Lazy Miner',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Lazy_Miner',
	},
	leo: {
		name: 'Leo',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Leo',
	},
	liam: {
		name: 'Liam',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Liam',
	},
	librarian: {
		name: 'Librarian',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Librarian',
	},
	lumberjack: {
		name: 'Lumber Jack',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Lumber_Jack',
	},
	lumina: {
		name: 'Lumina',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Lumina',
	},
	lynn: {
		name: 'Lynn',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Lynn',
	},
	madame_eleanor: {
		name: 'Madame Eleanor Q. Goldsworth III',
		short: 'Madame Eleanor',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Madame_Eleanor_Q._Goldsworth_III',
	},
	maeve: {
		name: 'Maeve',
		rarity: Rarity.Mythic,
		wiki: 'https://wiki.hypixel.net/Maeve',
	},
	mason: {
		name: 'Mason',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Mason',
	},
	odawa: {
		name: 'Odawa',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Odawa',
	},
	old_man_garry: {
		name: 'Old Man Garry',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Old_Man_Garry',
	},
	oringo: {
		name: 'Oringo',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Oringo',
	},
	pest_wrangler: {
		name: 'Pest Wrangler',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Pest_Wrangler',
	},
	disguised_rats: {
		name: 'Pest Wrangler?',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Pest_Wrangler%3F',
	},
	bear_pete: {
		name: 'Pete',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Pete',
	},
	plumber_joe: {
		name: 'Plumber Joe',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Plumber_Joe',
	},
	puzzler: {
		name: 'Puzzler',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Puzzler',
	},
	queen_mismyla: {
		name: 'Queen Mismyla',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Queen_Mismyla',
	},
	ravenous_rhino: {
		name: 'Ravenous Rhino',
		rarity: Rarity.Mythic,
		wiki: 'https://wiki.hypixel.net/Ravenous_Rhino',
	},
	rhys: {
		name: 'Rhys',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Rhys',
	},
	royal_resident_reward: {
		name: 'Royal Resident',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Royal_Resident',
	},
	royal_resident_peasant: {
		name: 'Royal Resident (Snooty)',
		short: 'Royal Res. (Snooty)',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Royal_Residents',
	},
	royal_resident_neighbour: {
		name: 'Royal Resident (Neighbor)',
		short: 'Royal Res. (Neighbor)',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Royal_Residents',
	},
	rusty: {
		name: 'Rusty',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Rusty',
	},
	ryu: {
		name: 'Ryu',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Ryu',
	},
	sargwyn: {
		name: 'Sargwyn',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Sargwyn',
	},
	seymour: {
		name: 'Seymour',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Seymour',
	},
	shaggy: {
		name: 'Shaggy',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Shaggy',
	},
	shifty: {
		name: 'Shifty',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Shifty',
	},
	sirius: {
		name: 'Sirius',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Sirius',
	},
	spaceman: {
		name: 'Spaceman',
		rarity: Rarity.Special,
		wiki: 'https://wiki.hypixel.net/Spaceman',
	},
	stella: {
		name: 'Stella',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Stella',
	},
	tammy: {
		name: 'Tammy',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Tammy',
	},
	tarwen: {
		name: 'Tarwen',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Tarwen',
	},
	terry: {
		name: 'Terry',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Terry',
	},
	tia: {
		name: 'Tia the Fairy',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Tia_the_Fairy',
	},
	tom: {
		name: 'Tom',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Tom',
	},
	trevor: {
		name: 'Trevor',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Trevor',
	},
	vex: {
		name: 'Vex',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Vex',
	},
	vinyl_collector: {
		name: 'Vinyl Collector',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Vinyl_Collector',
	},
	weaponsmith: {
		name: 'Weaponsmith',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Weaponsmith',
	},
	wizard: {
		name: 'Wizard',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Wizard',
	},
	xalx: {
		name: 'Xalx',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Xalx',
	},
	zog: {
		name: 'Zog',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Zog',
	},
};
