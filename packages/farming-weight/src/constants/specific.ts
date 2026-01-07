import { PEST_BESTIARY_IDS } from './pests.js';
import { Stat } from './stats.js';
import type { FortuneSource } from './upgrades.js';

export const GARDEN_CROP_UPGRADES: FortuneSource = {
	name: 'Garden Crop Upgrade',
	cropSpecific: true,
	fortunePerLevel: 5,
	maxLevel: 9,
	wiki: 'https://wiki.hypixel.net/Garden#Crop_Upgrades',
	upgradeCosts: {
		1: {
			copper: 5,
		},
		2: {
			copper: 10,
		},
		3: {
			copper: 20,
		},
		4: {
			copper: 50,
		},
		5: {
			copper: 100,
		},
		6: {
			copper: 500,
		},
		7: {
			copper: 1000,
		},
		8: {
			copper: 2000,
		},
		9: {
			copper: 4000,
		},
	},
};

export const UNLOCKED_PLOTS: FortuneSource = {
	name: 'Unlocked Plots',
	fortunePerLevel: 3,
	maxLevel: 24,
	wiki: 'https://wiki.hypixel.net/Garden#Stat_Rewards',
};

export const FARMING_LEVEL: FortuneSource = {
	name: 'Farming Level',
	fortunePerLevel: 4,
	maxLevel: 60,
	wiki: 'https://wiki.hypixel.net/Farming#Leveling_Rewards',
	upgradeCosts: {
		51: {
			medals: {
				gold: 1,
			},
		},
		52: {
			medals: {
				gold: 1,
			},
			items: {
				JACOBS_TICKET: 50,
			},
		},
		53: {
			medals: {
				gold: 1,
			},
			items: {
				JACOBS_TICKET: 50,
			},
		},
		54: {
			medals: {
				gold: 1,
			},
			items: {
				JACOBS_TICKET: 100,
			},
		},
		55: {
			medals: {
				gold: 1,
			},
			items: {
				JACOBS_TICKET: 100,
			},
		},
		56: {
			medals: {
				gold: 2,
			},
			items: {
				JACOBS_TICKET: 150,
			},
		},
		57: {
			medals: {
				gold: 2,
			},
			items: {
				JACOBS_TICKET: 150,
			},
		},
		58: {
			medals: {
				gold: 2,
			},
			items: {
				JACOBS_TICKET: 200,
			},
		},
		59: {
			medals: {
				gold: 2,
			},
			items: {
				JACOBS_TICKET: 250,
			},
		},
		60: {
			medals: {
				gold: 3,
			},
			items: {
				JACOBS_TICKET: 500,
			},
		},
	},
};

export const ANITA_FORTUNE_UPGRADE: FortuneSource = {
	name: 'Anita Bonus Fortune',
	fortunePerLevel: 4,
	maxLevel: 15,
	wiki: 'https://wiki.hypixel.net/Anita#Extra_Farming_Fortune',
	upgradeCosts: {
		1: {
			medals: {
				gold: 1,
			},
		},
		2: {
			items: {
				JACOBS_TICKET: 50,
			},
			medals: {
				gold: 1,
			},
		},
		3: {
			items: {
				JACOBS_TICKET: 50,
			},
			medals: {
				gold: 1,
			},
		},
		4: {
			items: {
				JACOBS_TICKET: 100,
			},
			medals: {
				gold: 2,
			},
		},
		5: {
			items: {
				JACOBS_TICKET: 100,
			},
			medals: {
				gold: 2,
			},
		},
		6: {
			items: {
				JACOBS_TICKET: 150,
			},
			medals: {
				gold: 3,
			},
		},
		7: {
			items: {
				JACOBS_TICKET: 150,
			},
			medals: {
				gold: 3,
			},
		},
		8: {
			items: {
				JACOBS_TICKET: 200,
			},
			medals: {
				gold: 4,
			},
		},
		9: {
			items: {
				JACOBS_TICKET: 200,
			},
			medals: {
				gold: 4,
			},
		},
		10: {
			items: {
				JACOBS_TICKET: 250,
			},
			medals: {
				gold: 5,
			},
		},
		11: {
			items: {
				JACOBS_TICKET: 300,
			},
			medals: {
				gold: 6,
			},
		},
		12: {
			items: {
				JACOBS_TICKET: 350,
			},
			medals: {
				gold: 71,
			},
		},
		13: {
			items: {
				JACOBS_TICKET: 400,
			},
			medals: {
				gold: 8,
			},
		},
		14: {
			items: {
				JACOBS_TICKET: 450,
			},
			medals: {
				gold: 9,
			},
		},
		15: {
			items: {
				JACOBS_TICKET: 1000,
			},
			medals: {
				gold: 10,
			},
		},
	},
};

export const COMMUNITY_CENTER_UPGRADE: FortuneSource = {
	name: 'Garden Farming Fortune',
	fortunePerLevel: 4,
	maxLevel: 10,
	wiki: 'https://wiki.hypixel.net/Elizabeth#Garden_Farming_Fortune_',
};

export const PEST_BESTIARY_SOURCE: FortuneSource = {
	name: 'Garden Bestiary',
	fortunePerLevel: 0.4,
	maxLevel: (Object.keys(PEST_BESTIARY_IDS).length * 6) / 0.4,
	wiki: 'https://wiki.hypixel.net/Bestiary#Garden_',
};

export const REFINED_TRUFFLE_SOURCE: FortuneSource = {
	name: 'Refined Dark Cacao Truffle',
	fortunePerLevel: 1,
	maxLevel: 5,
	wiki: 'https://wiki.hypixel.net/Refined_Dark_Cacao_Truffle',
};

export const FILLED_ROSEWATER_FLASK_SOURCE: FortuneSource = {
	name: 'Filled Rosewater Flask',
	fortunePerLevel: 1,
	maxLevel: 5,
	wiki: 'https://wiki.hypixel.net/Filled_Rosewater_Flask',
};

export const DNA_MILESTONE_SOURCE: FortuneSource = {
	name: 'DNA Analysis Milestone',
	fortunePerLevel: 5,
	maxLevel: 6,
	wiki: 'https://wiki.hypixel.net/DNA_Analysis',
};

export const WRIGGLING_LARVA_SOURCE: FortuneSource = {
	name: 'Wriggling Larva',
	fortunePerLevel: 0,
	statsPerLevel: {
		[Stat.BonusPestChance]: 2,
	},
	maxLevel: 5,
	wiki: 'https://wiki.hypixel.net/Wriggling_Larva',
};

export const COCOA_FORTUNE_UPGRADE: FortuneSource = {
	name: 'Cocoa Fortune Upgrade',
	cropSpecific: true,
	fortunePerLevel: 1,
	maxLevel: 25,
	wiki: 'https://wiki.hypixel.net/Chocolate_Factory#Chocolate_Shop',
};
