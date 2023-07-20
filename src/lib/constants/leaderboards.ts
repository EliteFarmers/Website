export enum LeaderboardType {
	Misc = 0,
	Collection = 1,
	Skill = 2,
}

export interface LeaderboardConfig {
	limit: number;
	type: LeaderboardType;
	name: string;
	icon?: string;
	title: string;
}

export const LEADERBOARDS: Record<string, LeaderboardConfig> = {
	farmingweight: {
		limit: 10_000,
		title: 'Farming Weight',
		name: 'Farming Weight',
		type: LeaderboardType.Misc,
	},
	skyblockxp: {
		limit: 5_000,
		title: 'Skyblock XP',
		name: 'Skyblock XP',
		type: LeaderboardType.Misc,
	},
	participations: {
		limit: 1_000,
		title: 'Jacob Contest Participations',
		name: 'Jacob Contests',
		type: LeaderboardType.Misc,
	},
	firstplace: {
		limit: 1_000,
		title: 'Jacob Contest First Places',
		name: 'First Place Contests',
		type: LeaderboardType.Misc,
	},
	goldmedals: {
		limit: 1_000,
		title: 'Gold Medals Earned',
		name: 'Gold Medals',
		icon: '/images/medals/gold.webp',
		type: LeaderboardType.Misc,
	},
	silvermedals: {
		limit: 1_000,
		title: 'Silver Medals Earned',
		name: 'Silver Medals',
		icon: '/images/medals/silver.webp',
		type: LeaderboardType.Misc,
	},
	bronzemedals: {
		limit: 1_000,
		title: 'Bronze Medals Earned',
		name: 'Bronze Medals',
		icon: '/images/medals/bronze.webp',
		type: LeaderboardType.Misc,
	},
	cactus: {
		limit: 1_000,
		title: 'Cactus Collection',
		name: 'Cactus',
		icon: '/images/crops/cactus.png',
		type: LeaderboardType.Collection,
	},
	carrot: {
		limit: 1_000,
		title: 'Carrot Collection',
		name: 'Carrot',
		icon: '/images/crops/carrot.png',
		type: LeaderboardType.Collection,
	},
	potato: {
		limit: 1_000,
		title: 'Potato Collection',
		name: 'Potato',
		icon: '/images/crops/potato.png',
		type: LeaderboardType.Collection,
	},
	pumpkin: {
		limit: 1_000,
		title: 'Pumpkin Collection',
		name: 'Pumpkin',
		icon: '/images/crops/pumpkin.png',
		type: LeaderboardType.Collection,
	},
	wheat: {
		limit: 1_000,
		title: 'Wheat Collection',
		name: 'Wheat',
		icon: '/images/crops/wheat.png',
		type: LeaderboardType.Collection,
	},
	melon: {
		limit: 1_000,
		title: 'Melon Collection',
		name: 'Melon',
		icon: '/images/crops/melon.png',
		type: LeaderboardType.Collection,
	},
	mushroom: {
		limit: 1_000,
		title: 'Mushroom Collection',
		name: 'Mushroom',
		icon: '/images/crops/mushroom.png',
		type: LeaderboardType.Collection,
	},
	cocoa: {
		limit: 1_000,
		title: 'Cocoa Bean Collection',
		name: 'Cocoa Bean',
		icon: '/images/crops/cocoa.png',
		type: LeaderboardType.Collection,
	},
	sugarcane: {
		limit: 1_000,
		title: 'Sugar Cane Collection',
		name: 'Sugar Cane',
		icon: '/images/crops/sugarcane.png',
		type: LeaderboardType.Collection,
	},
	netherwart: {
		limit: 1_000,
		title: 'Nether Wart Collection',
		name: 'Nether Wart',
		icon: '/images/crops/netherwart.png',
		type: LeaderboardType.Collection,
	},
	combat: {
		limit: 1_000,
		title: 'Combat XP',
		name: 'Combat',
		type: LeaderboardType.Skill,
	},
	mining: {
		limit: 1_000,
		title: 'Mining XP',
		name: 'Mining',
		type: LeaderboardType.Skill,
	},
	foraging: {
		limit: 1_000,
		title: 'Foraging XP',
		name: 'Foraging',
		type: LeaderboardType.Skill,
	},
	fishing: {
		limit: 1_000,
		title: 'Fishing XP',
		name: 'Fishing',
		type: LeaderboardType.Skill,
	},
	enchanting: {
		limit: 1_000,
		title: 'Enchanting XP',
		name: 'Enchanting',
		type: LeaderboardType.Skill,
	},
	alchemy: {
		limit: 1_000,
		title: 'Alchemy XP',
		name: 'Alchemy',
		type: LeaderboardType.Skill,
	},
	taming: {
		limit: 1_000,
		title: 'Taming XP',
		name: 'Taming',
		type: LeaderboardType.Skill,
	},
	carpentry: {
		limit: 1_000,
		title: 'Carpentry XP',
		name: 'Carpentry',
		type: LeaderboardType.Skill,
	},
	runecrafting: {
		limit: 1_000,
		title: 'Runecrafting XP',
		name: 'Runecrafting',
		type: LeaderboardType.Skill,
	},
	social: {
		limit: 1_000,
		title: 'Social XP',
		name: 'Social',
		type: LeaderboardType.Skill,
	},
	farming: {
		limit: 1_000,
		title: 'Farming XP',
		name: 'Farming',
		type: LeaderboardType.Skill,
	},
};

export const REDIRECT_ROUTES: Record<string, string> = {
	'/weight/farming': '/farmingweight',
	'/contests/count': '/participations',
	'/crops/cactus': '/cactus',
	'/crops/carrot': '/carrot',
	'/crops/potato': '/potato',
	'/crops/pumpkin': '/pumpkin',
	'/crops/wheat': '/wheat',
	'/crops/melon': '/melon',
	'/crops/mushroom': '/mushroom',
	'/crops/cocoa': '/cocoa',
	'/crops/sugarcane': '/sugarcane',
	'/crops/netherwart': '/netherwart',
	'/skills/combat': '/combat',
	'/skills/mining': '/mining',
	'/skills/foraging': '/foraging',
	'/skills/fishing': '/fishing',
	'/skills/enchanting': '/enchanting',
	'/skills/alchemy': '/alchemy',
	'/skills/taming': '/taming',
	'/skills/carpentry': '/carpentry',
	'/skills/runecrafting': '/runecrafting',
	'/skills/social': '/social',
	'/skills/farming': '/farming',
};
