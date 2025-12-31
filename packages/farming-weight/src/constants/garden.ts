import { Crop } from './crops.js';
import type { DepthStriderLevels } from './enchants.js';
import { Rarity } from './reforges.js';

export const GARDEN_EXP_REQUIRED = [
	0, 70, 70, 140, 240, 600, 1500, 2000, 2500, 3000, 10000, 10000, 10000, 10000, 10000,
];

export const CROP_MILESTONES: Record<Crop, number[]> = {
	[Crop.Wheat]: [
		30, 50, 80, 200, 350, 700, 1500, 2500, 3500, 5000, 6500, 8000, 10000, 20000, 35000, 50000, 75000, 100000,
		175000, 250000, 375000, 400000, 450000, 650000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000,
		800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000,
	],
	[Crop.Carrot]: [
		100, 150, 250, 500, 1000, 2000, 4500, 9000, 12000, 15000, 20000, 25000, 35000, 70000, 120000, 180000, 250000,
		350000, 600000, 850000, 1100000, 1400000, 1800000, 2200000, 2600000, 2600000, 2600000, 2600000, 2600000,
		2600000, 2600000, 2600000, 2600000, 2600000, 2600000, 2600000, 2600000, 2600000, 2600000, 2600000, 2600000,
		2600000, 2600000, 2600000, 2600000, 2600000,
	],
	[Crop.Potato]: [
		100, 150, 250, 500, 1000, 2000, 4500, 9000, 12000, 15000, 20000, 25000, 35000, 70000, 120000, 180000, 250000,
		350000, 600000, 850000, 1100000, 1400000, 1800000, 2200000, 2600000, 2600000, 2600000, 2600000, 2600000,
		2600000, 2600000, 2600000, 2600000, 2600000, 2600000, 2600000, 2600000, 2600000, 2600000, 2600000, 2600000,
		2600000, 2600000, 2600000, 2600000, 2600000,
	],
	[Crop.Melon]: [
		150, 250, 400, 1000, 1750, 3500, 7500, 12500, 17500, 25000, 32500, 40000, 50000, 100000, 175000, 250000, 375000,
		500000, 875000, 1250000, 1875000, 2000000, 2250000, 3250000, 4000000, 4000000, 4000000, 4000000, 4000000,
		4000000, 4000000, 4000000, 4000000, 4000000, 4000000, 4000000, 4000000, 4000000, 4000000, 4000000, 4000000,
		4000000, 4000000, 4000000, 4000000, 4000000,
	],
	[Crop.Pumpkin]: [
		30, 50, 80, 200, 350, 700, 1500, 2500, 3500, 5000, 6500, 8000, 10000, 20000, 35000, 50000, 75000, 100000,
		175000, 250000, 375000, 400000, 450000, 650000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000,
		800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000,
	],
	[Crop.SugarCane]: [
		60, 100, 160, 400, 700, 1400, 3000, 5000, 7000, 10000, 13000, 16000, 20000, 40000, 70000, 100000, 150000,
		200000, 350000, 500000, 750000, 800000, 900000, 1300000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000,
		1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000,
		1600000, 1600000, 1600000, 1600000,
	],
	[Crop.CocoaBeans]: [
		90, 150, 240, 600, 1050, 2100, 4500, 7500, 10500, 15000, 19500, 24000, 30000, 60000, 105000, 150000, 225000,
		300000, 525000, 750000, 1125000, 1200000, 1350000, 1950000, 2400000, 2400000, 2400000, 2400000, 2400000,
		2400000, 2400000, 2400000, 2400000, 2400000, 2400000, 2400000, 2400000, 2400000, 2400000, 2400000, 2400000,
		2400000, 2400000, 2400000, 2400000, 2400000,
	],
	[Crop.Cactus]: [
		60, 100, 160, 400, 700, 1400, 3000, 5000, 7000, 10000, 13000, 16000, 20000, 40000, 70000, 100000, 150000,
		200000, 350000, 500000, 750000, 800000, 900000, 1300000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000,
		1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000,
		1600000, 1600000, 1600000, 1600000,
	],
	[Crop.Mushroom]: [
		30, 50, 80, 200, 350, 700, 1500, 2500, 3500, 5000, 6500, 8000, 10000, 20000, 35000, 50000, 75000, 100000,
		175000, 250000, 375000, 400000, 450000, 650000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000,
		800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000,
	],
	[Crop.NetherWart]: [
		90, 150, 240, 600, 1050, 2100, 4500, 7500, 10500, 15000, 19500, 24000, 30000, 60000, 105000, 150000, 225000,
		300000, 525000, 750000, 1125000, 1200000, 1350000, 1950000, 2400000, 2400000, 2400000, 2400000, 2400000,
		2400000, 2400000, 2400000, 2400000, 2400000, 2400000, 2400000, 2400000, 2400000, 2400000, 2400000, 2400000,
		2400000, 2400000, 2400000, 2400000, 2400000,
	],
	[Crop.Seeds]: [],
	[Crop.Sunflower]: [
		30, 50, 80, 200, 350, 700, 1500, 2500, 3500, 5000, 6500, 8000, 10000, 20000, 35000, 50000, 75000, 100000,
		175000, 250000, 375000, 400000, 450000, 650000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000,
		800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000,
	],
	[Crop.Moonflower]: [
		30, 50, 80, 200, 700, 700, 1500, 2500, 3500, 5000, 6500, 8000, 10000, 20000, 35000, 50000, 75000, 100000,
		175000, 250000, 375000, 400000, 450000, 650000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000,
		800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000, 800000,
	],
	[Crop.WildRose]: [
		60, 100, 160, 400, 700, 1400, 3000, 5000, 7000, 10000, 13000, 16000, 20000, 40000, 70000, 100000, 150000,
		200000, 350000, 500000, 750000, 800000, 900000, 1300000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000,
		1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000, 1600000,
		1600000, 1600000, 1600000, 1600000,
	],
};

export interface GardenVisitor {
	name: string;
	short?: string;
	rarity: Rarity;
	wiki: string;
}

export const GARDEN_VISITORS: Partial<Record<string, GardenVisitor>> = {
	mayor_aatrox: {
		name: 'Aatrox',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Aatrox',
	},
	adventurer: {
		name: 'Adventurer',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Adventurer',
	},
	mage_alchemist: {
		name: 'Alchemage',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Alchemage',
	},
	alchemist: {
		name: 'Alchemist',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Alchemist',
	},
	an: {
		name: 'An',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/An',
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
	archaeologist: {
		name: 'Archaeologist',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Archaeologist',
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
	bednom: {
		name: 'Bednom',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Bednom',
	},
	beth: {
		name: 'Beth',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Beth',
	},
	bruuh: {
		name: 'Bruuh',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Bruuh',
	},
	carpenter: {
		name: 'Carpenter',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Carpenter',
	},
	chantelle: {
		name: 'Chantelle',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Chantelle',
	},
	chief_scorn: {
		name: 'Chief Scorn',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Chief_Scorn',
	},
	chunk: {
		name: 'Chunk',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Chunk',
	},
	seraphine: {
		name: 'Clerk Seraphine',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Clerk_Seraphine',
	},
	cold_enjoyer: {
		name: 'Cold Enjoyer',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Cold_Enjoyer',
	},
	mayor_cole: {
		name: 'Cole',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Cole',
	},
	dalbrek: {
		name: 'Dalbrek',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Dalbrek',
	},
	dante_goon: {
		name: 'Dante Goon',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Dante_Goon',
	},
	mayor_diana: {
		name: 'Diana',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Diana',
	},
	mayor_diaz: {
		name: 'Diaz',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Diaz',
	},
	duke: {
		name: 'Duke',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Duke',
	},
	dulin_tunnels: {
		name: 'Dulin',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Dulin',
	},
	duncan: {
		name: 'Duncan',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Duncan',
	},
	dusk: {
		name: 'Dusk',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Dusk',
	},
	elle: {
		name: 'Elle',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Elle',
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
	erihann: {
		name: 'Erihann',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Erihann',
	},
	pet_trainer: {
		name: 'Fann',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Fann',
	},
	farm_merchant: {
		name: 'Farm Merchant',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Farm_Merchant',
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
	mayor_finnegan: {
		name: 'Finnegan',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Finnegan',
	},
	fisherman: {
		name: 'Fisherman Gerald',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Fisherman_Gerald',
	},
	mayor_foxy: {
		name: 'Foxy',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Foxy',
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
	frozen_alex: {
		name: 'Frozen Alex',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Frozen_Alex',
	},
	snowmaker: {
		name: 'Gary',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Gary',
	},
	gemma: {
		name: 'Gemma',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Gemma',
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
	hendrik: {
		name: 'Hendrik',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Hendrik',
	},
	hoppity: {
		name: 'Hoppity',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Hoppity',
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
	jacobus: {
		name: 'Jacobus',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Jacobus',
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
	lift_operator: {
		name: 'Lift Operator',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Lift_Operator',
	},
	ludleth: {
		name: 'Ludleth',
		rarity: Rarity.Mythic,
		wiki: 'https://wiki.hypixel.net/Ludleth',
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
	artist: {
		name: 'Marco',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Marco',
	},
	marigold: {
		name: 'Marigold',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Marigold',
	},
	mayor_marina: {
		name: 'Marina',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Marina',
	},
	mason: {
		name: 'Mason',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Mason',
	},
	master_tactician: {
		name: 'Master Tactician Funk',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Master_Tactician_Funk',
	},
	moby: {
		name: 'Moby',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Moby',
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
	wolf_shaman: {
		name: 'Old Shaman Nyko',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Old_Shaman_Nyko',
	},
	ophelia: {
		name: 'Ophelia',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Ophelia',
	},
	oringo: {
		name: 'Oringo',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Oringo',
	},
	mayor_paul: {
		name: 'Paul',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Paul',
	},
	end_dealer: {
		name: 'Pearl Dealer',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Pearl_Dealer',
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
	queen_nyx: {
		name: 'Queen Nyx',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Queen_Nyx',
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
	romero: {
		name: 'Romero',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Romero',
	},
	royal_resident_reward: {
		name: 'Royal Resident',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Royal_Resident',
	},
	royal_resident_neighbour: {
		name: 'Royal Resident (Neighbor)',
		short: 'Royal Res. (Neighbor)',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Royal_Residents',
	},
	royal_resident_peasant: {
		name: 'Royal Resident (Snooty)',
		short: 'Royal Res. (Snooty)',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Royal_Residents',
	},
	rusty: {
		name: 'Rusty',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Rusty',
	},
	fire_guy: {
		name: 'Ryan',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Ryan',
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
	scardius: {
		name: 'Scout Scardius',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Scout_Scardius',
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
	sherry: {
		name: 'Sherry',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Sherry',
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
	spider_tamer: {
		name: 'Spider Tamer',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Spider_Tamer',
	},
	st_jerry: {
		name: 'St. Jerry',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/St._Jerry',
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
	tomioka: {
		name: 'Tomioka',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Tomioka',
	},
	trevor: {
		name: 'Trevor',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Trevor',
	},
	trinity: {
		name: 'Trinity',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Trinity',
	},
	tyashoi: {
		name: 'Tyashoi Alchemist',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Tyashoi_Alchemist',
	},
	dragon_ritualist: {
		name: 'Tyzzo',
		rarity: Rarity.Rare,
		wiki: 'https://wiki.hypixel.net/Tyzzo',
	},
	vargul_garden: {
		name: 'Vargul',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Vargul',
	},
	vex: {
		name: 'Vex',
		rarity: Rarity.Uncommon,
		wiki: 'https://wiki.hypixel.net/Vex',
	},
	vincent: {
		name: 'Vincent',
		rarity: Rarity.Legendary,
		wiki: 'https://wiki.hypixel.net/Vincent',
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

export const mcVersions = ['1.8.9', '1.21'] as const;
export type MinecraftVersion = (typeof mcVersions)[number];

export const directions = ['North', 'South', 'East', 'West'] as const;
export type Direction = (typeof directions)[number];

export const farmingMethods = ['straight', 'running into wall', 'angled into wall'] as const;
export type FarmingMethod = (typeof farmingMethods)[number];

export enum ResourceType {
	Thread,
	Video,
	Schematic,
	Garden,
}

export interface FarmDesignInfo {
	name: string;
	description?: string;
	crops: Crop[];
	speed: {
		'1.8.9': number;
		'1.21'?: number;
		depthStrider?: DepthStriderLevels;
		soulSand: boolean;
		method: FarmingMethod;
	};
	angle: {
		yaw: number;
		pitch: number;
	};
	bps: number;
	laneDepth: number;
	resources?: {
		source: string;
		type: ResourceType;
	}[];
	authors?: {
		name: string;
		url?: string;
	}[];
	replacedBy?: string[];
	notes?: string[];
}

const blackCatNote = 'Despite the name, this farm **does not** use a black cat pet anymore';

export const FARM_DESIGNS: Record<string, FarmDesignInfo> = {
	idkdomPumpkin: {
		name: 'IdkDom Melon/Pumpkin',
		crops: [Crop.Melon, Crop.Pumpkin],
		speed: {
			'1.8.9': 155,
			soulSand: false,
			method: 'straight',
		},
		angle: {
			yaw: 0,
			pitch: 28.5,
		},
		bps: 19.7,
		laneDepth: 3,
		resources: [
			{
				source: 'https://youtu.be/Zy_w332uUic',
				type: ResourceType.Video,
			},
			{
				source: 'IdkDom',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'IdkDom',
				url: 'https://www.youtube.com/@IdkDom',
			},
		],
		replacedBy: ['easierMelon', 'chisslMelon'],
	},
	blackCatMelon: {
		name: 'SunTzu & MelonKingDe Black Cat Melon',
		crops: [Crop.Melon, Crop.Pumpkin],
		speed: {
			'1.8.9': 400,
			'1.21': 368,
			depthStrider: 3,
			soulSand: true,
			method: 'running into wall',
		},
		angle: {
			yaw: 0,
			pitch: -59,
		},
		bps: 19.93,
		laneDepth: 3,
		resources: [
			{
				source: 'https://discord.com/channels/1096051612373487687/1159960881287942234',
				type: ResourceType.Thread,
			},
			{
				source: 'https://youtu.be/5k9c7qK0l58',
				type: ResourceType.Video,
			},
			{
				source: 'MelonKingDe',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
			{
				name: 'MelonKingDe',
				url: 'https://www.youtube.com/@SunTzu-MelonKing',
			},
			{
				name: 'SunTzu101',
				url: 'https://www.youtube.com/@SunTzu-MelonKing',
			},
		],
		replacedBy: ['easierMelon', 'chisslMelon'],
		notes: [blackCatNote],
	},
	easierMelon: {
		name: 'Easier to Build Melon/Pumpkin',
		crops: [Crop.Melon, Crop.Pumpkin],
		speed: {
			'1.8.9': 400,
			'1.21': 368,
			depthStrider: 3,
			soulSand: true,
			method: 'running into wall',
		},
		angle: {
			yaw: 0,
			pitch: -59,
		},
		bps: 19.94,
		laneDepth: 3,
		resources: [
			{
				source: 'https://discord.com/channels/1096051612373487687/1358514959247741068',
				type: ResourceType.Thread,
			},
			{
				source: 'https://youtu.be/s4HV0RyWcoI',
				type: ResourceType.Video,
			},
			{
				source: 'IdkVenom',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
			{
				name: 'MelonKingDe',
				url: 'https://www.youtube.com/@SunTzu-MelonKing',
			},
			{
				name: 'IdkVenom',
				url: 'https://www.youtube.com/@IdkVenomDeadlyIPanda',
			},
			{
				name: 'DeadlyIPanda',
				url: 'https://www.youtube.com/@IdkVenomDeadlyIPanda',
			},
		],
	},
	chisslMelon: {
		name: 'Chissl Waterless Melon/Pumpkin',
		crops: [Crop.Melon, Crop.Pumpkin],
		speed: {
			'1.8.9': 360,
			depthStrider: 1,
			soulSand: false,
			method: 'running into wall',
		},
		angle: {
			yaw: 0,
			pitch: 59,
		},
		bps: 19.95,
		laneDepth: 3,
		resources: [
			{
				source: 'Chissl',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
			{
				name: 'Chissl',
			},
		],
		notes: [
			'Very difficult and time consuming to build, only worthwhile for extreme farmers',
			'Great for pest farming, most recommended design if you pest farm with melons often',
		],
	},
	dropdownWheat: {
		name: 'Dropdown Wheat/Potato/Carrot/Netherwart',
		crops: [Crop.Wheat, Crop.Potato, Crop.Carrot, Crop.NetherWart],
		speed: {
			'1.8.9': 93,
			depthStrider: 3,
			soulSand: false,
			method: 'straight',
		},
		angle: {
			yaw: 0,
			pitch: 3,
		},
		bps: 19.85,
		laneDepth: 5,
		replacedBy: ['aceWheat', 'draipWheat', 'z109Wheat'],
		notes: ['Annoying to use', 'Not infinite even at garden 15', 'Requires 5 plots, no less'],
	},
	aceWheat: {
		name: 'Ace Wheat/Potato/Carrot/Netherwart',
		crops: [Crop.Wheat, Crop.Potato, Crop.Carrot, Crop.NetherWart],
		speed: {
			'1.8.9': 347,
			'1.21': 308,
			depthStrider: 2,
			soulSand: true,
			method: 'running into wall',
		},
		angle: {
			yaw: 0,
			pitch: 3,
		},
		bps: 20,
		laneDepth: 5,
		resources: [
			{
				source: 'https://youtu.be/hz4lGUz0JP4',
				type: ResourceType.Video,
			},
			{
				source: 'sageuk',
				type: ResourceType.Garden,
			},
			{
				source: 'FarmingHub',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
		],
	},
	draipWheat: {
		name: 'Draip Looping Wheat/Potato/Carrot/Netherwart',
		crops: [Crop.Wheat, Crop.Potato, Crop.Carrot, Crop.NetherWart],
		speed: {
			'1.8.9': 328,
			depthStrider: 3,
			soulSand: false,
			method: 'angled into wall',
		},
		angle: {
			yaw: 45,
			pitch: 3,
		},
		bps: 20,
		laneDepth: 3,
		resources: [
			{
				source: 'https://discord.com/channels/1096051612373487687/1159965565218201721',
				type: ResourceType.Thread,
			},
			{
				source: 'https://youtu.be/gcJ5U7SyA-c',
				type: ResourceType.Video,
			},
		],
		authors: [
			{
				name: 'Draip',
				url: 'https://www.youtube.com/@draiping',
			},
		],
		notes: [
			'Nice for pest farming because it loops, but it doesn require more plots than other designs',
			'Lanes can be as deep as you want, deeper means laneswitches are easier',
		],
	},
	z109Wheat: {
		name: 'Z109 Sprial Wheat/Potato/Carrot/Netherwart',
		crops: [Crop.Wheat, Crop.Potato, Crop.Carrot, Crop.NetherWart],
		speed: {
			'1.8.9': 328,
			depthStrider: 3,
			soulSand: false,
			method: 'angled into wall',
		},
		angle: {
			yaw: 45,
			pitch: 3,
		},
		bps: 20,
		laneDepth: 3,
		resources: [
			{
				source: 'https://discord.com/channels/1096051612373487687/1253213095984365629',
				type: ResourceType.Thread,
			},
			{
				source: 'https://youtu.be/9yVNsafjOCA',
				type: ResourceType.Video,
			},
			{
				source: 'Z109',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
			{
				name: 'Z109',
				url: 'https://www.youtube.com/@Z109',
			},
		],
	},
	blackCatWheat: {
		name: 'Black Cat Wheat/Potato/Carrot',
		crops: [Crop.Wheat, Crop.Potato, Crop.Carrot],
		speed: {
			'1.8.9': 347,
			'1.21': 308,
			depthStrider: 2,
			soulSand: true,
			method: 'running into wall',
		},
		angle: {
			yaw: 0,
			pitch: 3,
		},
		bps: 19.93,
		laneDepth: 5,
		resources: [
			{
				source: 'https://discord.com/channels/1096051612373487687/1159961248545374290',
				type: ResourceType.Thread,
			},
			{
				source: 'https://youtu.be/KBGIuETQI-g',
				type: ResourceType.Video,
			},
			{
				source: 'MelonKingDe',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
			{
				name: 'MelonKingDe',
				url: 'https://www.youtube.com/@SunTzu-MelonKing',
			},
			{
				name: 'SunTzu101',
				url: 'https://www.youtube.com/@SunTzu-MelonKing',
			},
		],
		replacedBy: ['aceWheat', 'draipWheat', 'z109Wheat'],
		notes: [blackCatNote],
	},
	blackCatNetherwart: {
		name: 'Black Cat Nether Wart',
		crops: [Crop.NetherWart],
		speed: {
			'1.8.9': 347,
			'1.21': 308,
			depthStrider: 2,
			soulSand: true,
			method: 'running into wall',
		},
		angle: {
			yaw: 0,
			pitch: 3,
		},
		bps: 19.93,
		laneDepth: 5,
		resources: [
			{
				source: 'https://discord.com/channels/1096051612373487687/1159961642952556636',
				type: ResourceType.Thread,
			},
			{
				source: 'https://youtu.be/n218KDmL-5s',
				type: ResourceType.Video,
			},
			{
				source: 'MelonKingDe',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
			{
				name: 'MelonKingDe',
				url: 'https://www.youtube.com/@SunTzu-MelonKing',
			},
			{
				name: 'SunTzu101',
				url: 'https://www.youtube.com/@SunTzu-MelonKing',
			},
		],
		replacedBy: ['aceWheat', 'draipWheat', 'z109Wheat'],
		notes: [blackCatNote],
	},
	sdsMushroom: {
		name: 'Slanted Downward Spiral (SDS) Mushroom',
		crops: [Crop.Mushroom],
		speed: {
			'1.8.9': 233,
			depthStrider: 3,
			soulSand: true,
			method: 'angled into wall',
		},
		angle: {
			yaw: 16,
			pitch: 5.5,
		},
		bps: 19.8,
		laneDepth: 4,
		resources: [
			{
				source: 'https://discord.com/channels/1096051612373487687/1159960305300930631',
				type: ResourceType.Thread,
			},
			{
				source: 'https://youtu.be/QyWf0DO831g',
				type: ResourceType.Video,
			},
			{
				source: 'MelonKingDe',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
			{
				name: 'MelonKingDe',
				url: 'https://www.youtube.com/@SunTzu-MelonKing',
			},
			{
				name: 'SunTzu101',
				url: 'https://www.youtube.com/@SunTzu-MelonKing',
			},
		],
		replacedBy: ['idkpoisonMushroom'],
	},
	idkpoisonMushroom: {
		name: 'IdkPoison_ Mushroom',
		crops: [Crop.Mushroom],
		speed: {
			'1.8.9': 259,
			soulSand: false,
			method: 'angled into wall',
		},
		angle: {
			yaw: 26.57,
			pitch: 0,
		},
		bps: 19.98,
		laneDepth: 4,
		resources: [
			{
				source: 'IdkPoison_',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
			{
				name: 'IdkPoison_',
			},
		],
	},
	blackCatCocoa: {
		name: 'Black Cat Cocoa',
		crops: [Crop.CocoaBeans],
		speed: {
			'1.8.9': 400,
			'1.21': 368,
			depthStrider: 3,
			soulSand: true,
			method: 'running into wall',
		},
		angle: {
			yaw: 0,
			pitch: -45,
		},
		bps: 19.98,
		laneDepth: 3,
		resources: [
			{
				source: 'https://discord.com/channels/1096051612373487687/1159959995329298443',
				type: ResourceType.Thread,
			},
			{
				source: 'https://youtu.be/WWR2duiwxK4',
				type: ResourceType.Video,
			},
			{
				source: 'FarmingHub',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
		],
		notes: [blackCatNote],
	},
	singleLaneCocoa: {
		name: 'Single Lane Cocoa',
		crops: [Crop.CocoaBeans],
		speed: {
			'1.8.9': 215,
			soulSand: false,
			method: 'running into wall',
		},
		angle: {
			yaw: 0,
			pitch: -45,
		},
		bps: 19.97,
		laneDepth: 3,
		resources: [
			{
				source: 'not_a_cowfr',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'not a cow',
			},
			{
				name: 'Binrich',
			},
		],
		notes: [
			"Easier to build and use than regular cocoa, but wont work if you don't hold D (but doing so is better anyway so it doesn't really matter)",
			'The trapdoors used are **not needed**',
		],
	},
	blackCatCactus: {
		name: 'Black Cat Cactus',
		crops: [Crop.Cactus],
		speed: {
			'1.8.9': 464,
			depthStrider: 3,
			soulSand: false,
			method: 'straight',
		},
		angle: {
			yaw: 0,
			pitch: 0,
		},
		bps: 19.7,
		laneDepth: 1,
		resources: [
			{
				source: 'https://discord.com/channels/1096051612373487687/1159959766748119050',
				type: ResourceType.Thread,
			},
			{
				source: 'https://youtu.be/Kj7qxeq1jEw',
				type: ResourceType.Video,
			},
			{
				source: 'MelonKingDe',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
			{
				name: 'MelonKingDe',
				url: 'https://www.youtube.com/@SunTzu-MelonKing',
			},
			{
				name: 'SunTzu101',
				url: 'https://www.youtube.com/@SunTzu-MelonKing',
			},
		],
		notes: [
			'Despite the name, this farm **does not** use a black cat pet anymore, instead, cactus knife raises speed cap now',
		],
	},
	aceCactus: {
		name: 'Ace Cactus',
		crops: [Crop.Cactus],
		speed: {
			'1.8.9': 464,
			depthStrider: 3,
			soulSand: false,
			method: 'straight',
		},
		angle: {
			yaw: 0,
			pitch: 0,
		},
		bps: 20,
		laneDepth: 1,
		resources: [
			{
				source: 'LunaSappho',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
		],
		notes: ["Don't worry about getting over 400 speed, cactus knife raises speed cap by 100"],
	},
	regularCane: {
		name: 'Regular Sugar Cane',
		crops: [Crop.SugarCane],
		speed: {
			'1.8.9': 328,
			soulSand: false,
			method: 'angled into wall',
		},
		angle: {
			yaw: 45,
			pitch: 0,
		},
		bps: 19.95,
		laneDepth: 2,
		resources: [
			{
				source: 'https://discord.com/channels/1096051612373487687/1159960545487761479',
				type: ResourceType.Thread,
			},
			{
				source: 'https://youtu.be/nQ5yjQU9gmo',
				type: ResourceType.Video,
			},
			{
				source: 'MelonKingDe',
				type: ResourceType.Garden,
			},
		],
	},
	reverseCane: {
		name: 'Reverse Sugar Cane',
		crops: [Crop.SugarCane],
		speed: {
			'1.8.9': 328,
			soulSand: false,
			method: 'angled into wall',
		},
		angle: {
			yaw: 45,
			pitch: 0,
		},
		bps: 20,
		laneDepth: 2,
		resources: [
			{
				source: 'FarmingHub',
				type: ResourceType.Garden,
			},
		],
		authors: [
			{
				name: 'AgitatedSnake92',
			},
		],
	},
};
