import { Crop } from './crops';
import { Rarity } from './reforges';

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
}

export const GARDEN_VISITORS: Partial<Record<string, GardenVisitor>> = {
	adventurer: {
		name: 'Adventurer',
		rarity: Rarity.Uncommon,
	},
	alchemist: {
		name: 'Alchemist',
		rarity: Rarity.Uncommon,
	},
	andrew: {
		name: 'Andrew',
		rarity: Rarity.Uncommon,
	},
	anita: {
		name: 'Anita',
		rarity: Rarity.Uncommon,
	},
	arthur: {
		name: 'Arthur',
		rarity: Rarity.Uncommon,
	},
	baker: {
		name: 'Baker',
		rarity: Rarity.Legendary,
	},
	banker_broadjaw: {
		name: 'Banker Broadjaw',
		rarity: Rarity.Uncommon,
	},
	bartender: {
		name: 'Bartender',
		rarity: Rarity.Rare,
	},
	beth: {
		name: 'Beth',
		rarity: Rarity.Legendary,
	},
	seraphine: {
		name: 'Clerk Seraphine',
		rarity: Rarity.Legendary,
	},
	dalbrek: {
		name: 'Dalbrek',
		rarity: Rarity.Rare,
	},
	duke: {
		name: 'Duke',
		rarity: Rarity.Uncommon,
	},
	dusk: {
		name: 'Dusk',
		rarity: Rarity.Uncommon,
	},
	emissary_carlton: {
		name: 'Emissary Carlton',
		rarity: Rarity.Uncommon,
	},
	emissary_ceanna: {
		name: 'Emissary Ceanna',
		rarity: Rarity.Uncommon,
	},
	emissary_fraiser: {
		name: 'Emissary Fraiser',
		rarity: Rarity.Uncommon,
	},
	emissary_sisko: {
		name: 'Emissary Sisko',
		rarity: Rarity.Rare,
	},
	emissary_wilson: {
		name: 'Emissary Wilson',
		rarity: Rarity.Uncommon,
	},
	farmer_jon: {
		name: 'Farmer Jon',
		rarity: Rarity.Uncommon,
	},
	farmhand: {
		name: 'Farmhand',
		rarity: Rarity.Uncommon,
	},
	fear_mongerer: {
		name: 'Fear Mongerer',
		rarity: Rarity.Uncommon,
	},
	felix: {
		name: 'Felix',
		rarity: Rarity.Uncommon,
	},
	fisherman: {
		name: 'Fisherman',
		rarity: Rarity.Uncommon,
	},
	fragilis: {
		name: 'Fragilis',
		rarity: Rarity.Rare,
	},
	friendly_hiker: {
		name: 'Friendly Hiker',
		rarity: Rarity.Uncommon,
	},
	geonathan_greatforge: {
		name: 'Geonathan Greatforge',
		rarity: Rarity.Uncommon,
	},
	gimley: {
		name: 'Gimley',
		rarity: Rarity.Uncommon,
	},
	gold_forger: {
		name: 'Gold Forger',
		rarity: Rarity.Rare,
	},
	grandma_wolf: {
		name: 'Grandma Wolf',
		rarity: Rarity.Rare,
	},
	guy: {
		name: 'Guy',
		rarity: Rarity.Uncommon,
	},
	gwendolyn: {
		name: 'Gwendolyn',
		rarity: Rarity.Rare,
	},
	hornum: {
		name: 'Hornum',
		rarity: Rarity.Uncommon,
	},
	hungry_hiker: {
		name: 'Hungry Hiker',
		rarity: Rarity.Uncommon,
	},
	iron_forger: {
		name: 'Iron Forger',
		rarity: Rarity.Rare,
	},
	jack: {
		name: 'Jack',
		rarity: Rarity.Uncommon,
	},
	jacob: {
		name: 'Jacob',
		rarity: Rarity.Uncommon,
	},
	jamie: {
		name: 'Jamie',
		rarity: Rarity.Uncommon,
	},
	jerry: {
		name: 'Jerry',
		rarity: Rarity.Legendary,
	},
	jotraeline_greatforge: {
		name: 'Jotraeline Greatforge',
		rarity: Rarity.Uncommon,
	},
	lazy_miner: {
		name: 'Lazy Miner',
		rarity: Rarity.Rare,
	},
	leo: {
		name: 'Leo',
		rarity: Rarity.Uncommon,
	},
	liam: {
		name: 'Liam',
		rarity: Rarity.Uncommon,
	},
	librarian: {
		name: 'Librarian',
		rarity: Rarity.Uncommon,
	},
	lumberjack: {
		name: 'Lumber Jack',
		rarity: Rarity.Uncommon,
	},
	lumina: {
		name: 'Lumina',
		rarity: Rarity.Rare,
	},
	lynn: {
		name: 'Lynn',
		rarity: Rarity.Uncommon,
	},
	madame_eleanor: {
		name: 'Madame Eleanor Q. Goldsworth III',
		short: 'Madame Eleanor',
		rarity: Rarity.Legendary,
	},
	maeve: {
		name: 'Maeve',
		rarity: Rarity.Mythic,
	},
	mason: {
		name: 'Mason',
		rarity: Rarity.Uncommon,
	},
	odawa: {
		name: 'Odawa',
		rarity: Rarity.Uncommon,
	},
	old_man_garry: {
		name: 'Old Man Garry',
		rarity: Rarity.Rare,
	},
	oringo: {
		name: 'Oringo',
		rarity: Rarity.Uncommon,
	},
	pest_wrangler: {
		name: 'Pest Wrangler',
		rarity: Rarity.Uncommon,
	},
	disguised_rats: {
		name: 'Pest Wrangler?',
		rarity: Rarity.Legendary,
	},
	bear_pete: {
		name: 'Pete',
		rarity: Rarity.Rare,
	},
	plumber_joe: {
		name: 'Plumber Joe',
		rarity: Rarity.Uncommon,
	},
	puzzler: {
		name: 'Puzzler',
		rarity: Rarity.Rare,
	},
	queen_mismyla: {
		name: 'Queen Mismyla',
		rarity: Rarity.Rare,
	},
	ravenous_rhino: {
		name: 'Ravenous Rhino',
		rarity: Rarity.Mythic,
	},
	rhys: {
		name: 'Rhys',
		rarity: Rarity.Uncommon,
	},
	royal_resident_reward: {
		name: 'Royal Resident',
		rarity: Rarity.Rare,
	},
	royal_resident_peasant: {
		name: 'Royal Resident (Snooty)',
		short: 'Royal Res. (Snooty)',
		rarity: Rarity.Uncommon,
	},
	royal_resident_neighbour: {
		name: 'Royal Resident (Neighbor)',
		short: 'Royal Res. (Neighbor)',
		rarity: Rarity.Uncommon,
	},
	rusty: {
		name: 'Rusty',
		rarity: Rarity.Rare,
	},
	ryu: {
		name: 'Ryu',
		rarity: Rarity.Uncommon,
	},
	sargwyn: {
		name: 'Sargwyn',
		rarity: Rarity.Uncommon,
	},
	seymour: {
		name: 'Seymour',
		rarity: Rarity.Rare,
	},
	shaggy: {
		name: 'Shaggy',
		rarity: Rarity.Uncommon,
	},
	shifty: {
		name: 'Shifty',
		rarity: Rarity.Rare,
	},
	sirius: {
		name: 'Sirius',
		rarity: Rarity.Legendary,
	},
	spaceman: {
		name: 'Spaceman',
		rarity: Rarity.Special,
	},
	stella: {
		name: 'Stella',
		rarity: Rarity.Uncommon,
	},
	tammy: {
		name: 'Tammy',
		rarity: Rarity.Rare,
	},
	tarwen: {
		name: 'Tarwen',
		rarity: Rarity.Uncommon,
	},
	terry: {
		name: 'Terry',
		rarity: Rarity.Uncommon,
	},
	tia: {
		name: 'Tia the Fairy',
		rarity: Rarity.Rare,
	},
	tom: {
		name: 'Tom',
		rarity: Rarity.Uncommon,
	},
	trevor: {
		name: 'Trevor',
		rarity: Rarity.Uncommon,
	},
	vex: {
		name: 'Vex',
		rarity: Rarity.Uncommon,
	},
	vinyl_collector: {
		name: 'Vinyl Collector',
		rarity: Rarity.Rare,
	},
	weaponsmith: {
		name: 'Weaponsmith',
		rarity: Rarity.Uncommon,
	},
	wizard: {
		name: 'Wizard',
		rarity: Rarity.Uncommon,
	},
	xalx: {
		name: 'Xalx',
		rarity: Rarity.Uncommon,
	},
	zog: {
		name: 'Zog',
		rarity: Rarity.Rare,
	},
};
