import type { GemSlotCost, GemSlotRequirement } from '../../fortune/upgradeable.js';

export type ToolGemSlot = {
	slot_type: string;
	costs: GemSlotCost[];
	requirements?: GemSlotRequirement[];
};

// Tier 1 gem slots (2 slots, level 5 and 15 requirements)
export const T1_TOOL_GEMS: ToolGemSlot[] = [
	{
		slot_type: 'PERIDOT',
		costs: [
			{ type: 'ITEM', item_id: 'FINE_PERIDOT_GEM', amount: 20 },
			{ type: 'COINS', coins: 50000 },
		],
		requirements: [
			{ type: 'ITEM_DATA', data_key: 'levelable_lvl', value: '5', operator: 'GREATER_THAN_OR_EQUALS' },
		],
	},
	{
		slot_type: 'PERIDOT',
		costs: [
			{ type: 'ITEM', item_id: 'FINE_PERIDOT_GEM', amount: 40 },
			{ type: 'COINS', coins: 100000 },
		],
		requirements: [
			{ type: 'ITEM_DATA', data_key: 'levelable_lvl', value: '15', operator: 'GREATER_THAN_OR_EQUALS' },
		],
	},
];

// Tier 2 gem slots (3 slots, level 5, 15, and 25 requirements)
export const T2_TOOL_GEMS: ToolGemSlot[] = [
	{
		slot_type: 'PERIDOT',
		costs: [
			{ type: 'ITEM', item_id: 'FINE_PERIDOT_GEM', amount: 20 },
			{ type: 'COINS', coins: 50000 },
		],
		requirements: [
			{ type: 'ITEM_DATA', data_key: 'levelable_lvl', value: '5', operator: 'GREATER_THAN_OR_EQUALS' },
		],
	},
	{
		slot_type: 'PERIDOT',
		costs: [
			{ type: 'ITEM', item_id: 'FINE_PERIDOT_GEM', amount: 40 },
			{ type: 'COINS', coins: 100000 },
		],
		requirements: [
			{ type: 'ITEM_DATA', data_key: 'levelable_lvl', value: '15', operator: 'GREATER_THAN_OR_EQUALS' },
		],
	},
	{
		slot_type: 'PERIDOT',
		costs: [
			{ type: 'ITEM', item_id: 'FLAWLESS_PERIDOT_GEM', amount: 1 },
			{ type: 'COINS', coins: 250000 },
		],
		requirements: [
			{ type: 'ITEM_DATA', data_key: 'levelable_lvl', value: '25', operator: 'GREATER_THAN_OR_EQUALS' },
		],
	},
];

// Tier 3 gem slots (4 slots, level 5, 15, 25, and 50 requirements)
export const T3_TOOL_GEMS: ToolGemSlot[] = [
	{
		slot_type: 'PERIDOT',
		costs: [
			{ type: 'ITEM', item_id: 'FINE_PERIDOT_GEM', amount: 20 },
			{ type: 'COINS', coins: 50000 },
		],
		requirements: [
			{ type: 'ITEM_DATA', data_key: 'levelable_lvl', value: '5', operator: 'GREATER_THAN_OR_EQUALS' },
		],
	},
	{
		slot_type: 'PERIDOT',
		costs: [
			{ type: 'ITEM', item_id: 'FINE_PERIDOT_GEM', amount: 40 },
			{ type: 'COINS', coins: 100000 },
		],
		requirements: [
			{ type: 'ITEM_DATA', data_key: 'levelable_lvl', value: '15', operator: 'GREATER_THAN_OR_EQUALS' },
		],
	},
	{
		slot_type: 'PERIDOT',
		costs: [
			{ type: 'ITEM', item_id: 'FLAWLESS_PERIDOT_GEM', amount: 1 },
			{ type: 'COINS', coins: 250000 },
		],
		requirements: [
			{ type: 'ITEM_DATA', data_key: 'levelable_lvl', value: '25', operator: 'GREATER_THAN_OR_EQUALS' },
		],
	},
	{
		slot_type: 'PERIDOT',
		costs: [
			{ type: 'ITEM', item_id: 'FLAWLESS_PERIDOT_GEM', amount: 2 },
			{ type: 'COINS', coins: 1000000 },
		],
		requirements: [
			{ type: 'ITEM_DATA', data_key: 'levelable_lvl', value: '50', operator: 'GREATER_THAN_OR_EQUALS' },
		],
	},
];
