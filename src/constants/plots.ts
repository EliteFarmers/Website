import { UpgradeCost } from './upgrades.js';

export const enum PlotType {
	Beginner = 'beginner',
	Intermediate = 'intermediate',
	Advanced = 'advanced',
	Expert = 'expert',
}

export const GARDEN_PLOTS = {
	beginner_1: {
		name: '2',
		type: PlotType.Beginner,
		position: [1, 2],
	},
	beginner_2: {
		name: '1',
		type: PlotType.Beginner,
		position: [2, 1],
	},
	beginner_3: {
		name: '4',
		type: PlotType.Beginner,
		position: [2, 3],
	},
	beginner_4: {
		name: '3',
		type: PlotType.Beginner,
		position: [3, 2],
	},
	intermediate_1: {
		name: '5',
		type: PlotType.Intermediate,
		position: [1, 1],
	},
	intermediate_2: {
		name: '7',
		type: PlotType.Intermediate,
		position: [1, 3],
	},
	intermediate_3: {
		name: '6',
		type: PlotType.Intermediate,
		position: [3, 1],
	},
	intermediate_4: {
		name: '8',
		type: PlotType.Intermediate,
		position: [3, 3],
	},
	advanced_1: {
		name: '15',
		type: PlotType.Advanced,
		position: [0, 1],
	},
	advanced_2: {
		name: '10',
		type: PlotType.Advanced,
		position: [0, 2],
	},
	advanced_3: {
		name: '17',
		type: PlotType.Advanced,
		position: [0, 3],
	},
	advanced_4: {
		name: '13',
		type: PlotType.Advanced,
		position: [1, 0],
	},
	advanced_5: {
		name: '19',
		type: PlotType.Advanced,
		position: [1, 4],
	},
	advanced_6: {
		name: '9',
		type: PlotType.Advanced,
		position: [2, 0],
	},
	advanced_7: {
		name: '12',
		type: PlotType.Advanced,
		position: [2, 4],
	},
	advanced_8: {
		name: '14',
		type: PlotType.Advanced,
		position: [3, 0],
	},
	advanced_9: {
		name: '20',
		type: PlotType.Advanced,
		position: [3, 4],
	},
	advanced_10: {
		name: '16',
		type: PlotType.Advanced,
		position: [4, 1],
	},
	advanced_11: {
		name: '11',
		type: PlotType.Advanced,
		position: [4, 2],
	},
	advanced_12: {
		name: '18',
		type: PlotType.Advanced,
		position: [4, 3],
	},
	expert_1: {
		name: '21',
		type: PlotType.Expert,
		position: [0, 0],
	},
	expert_2: {
		name: '23',
		type: PlotType.Expert,
		position: [0, 4],
	},
	expert_3: {
		name: '22',
		type: PlotType.Expert,
		position: [4, 0],
	},
	expert_4: {
		name: '24',
		type: PlotType.Expert,
		position: [4, 4],
	},
};

export const GARDEN_PLOT_COSTS: Record<PlotType, UpgradeCost[]> = {
	[PlotType.Beginner]: [
		{ items: { COMPOST: 1 } },
		{ items: { COMPOST: 2 } },
		{ items: { COMPOST: 4 } },
		{ items: { COMPOST: 8 } },
	],
	[PlotType.Intermediate]: [
		{ items: { COMPOST: 16 } },
		{ items: { COMPOST: 24 } },
		{ items: { COMPOST: 32 } },
		{ items: { COMPOST: 48 } },
	],
	[PlotType.Advanced]: [
		{ items: { COMPOST: 64 } },
		{ items: { COMPOST: 96 } },
		{ items: { COMPOST: 128 } },
		{ items: { COMPOST: 160 } },
		{ items: { COMPOST: 160 } },
		{ items: { COMPOST: 2 * 160 } },
		{ items: { COMPOST: 2 * 160 } },
		{ items: { COMPOST: 3 * 160 } },
		{ items: { COMPOST: 3 * 160 } },
		{ items: { COMPOST: 4 * 160 } },
		{ items: { COMPOST: 5 * 160 } },
		{ items: { COMPOST: 7 * 160 } },
	],
	[PlotType.Expert]: [
		{ items: { COMPOST: 8 * 160 } },
		{ items: { COMPOST: 10 * 160 } },
		{ items: { COMPOST: 12 * 160 } },
		{ items: { COMPOST: 15 * 160 } },
	],
};
