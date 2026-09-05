import * as Select from '$ui/select';
import type { Step } from '$ui/walkthrough/ctx';

export const TIME_OPTIONS = [
	{ value: 24_000, label: 'Jacob Contest' },
	{ value: 72_000, label: '1 Hour' },
	{ value: 288_000, label: '4 Hours' },
	{ value: 864_000, label: '12 Hours' },
	{ value: 1_728_000, label: '24 Hours' },
];

export const PET_OPTIONS = [
	{ value: 'rose_dragon', label: 'Rose Dragon' },
	{ value: 'mooshroom', label: 'Mooshroom Cow' },
	{ value: 'elephant', label: 'Elephant' },
];

export const REFORGE_OPTIONS = [
	{ value: 'bountiful', label: 'Bountiful' },
	{ value: 'blessed', label: 'Blessed' },
];

export const BAZAAR_MODE_OPTIONS: { value: 'order' | 'insta'; label: string }[] = [
	{ value: 'order', label: 'Sell Order' },
	{ value: 'insta', label: 'Insta-Sell' },
];

export const profitColumns = [
	{ key: 'npcProfit', label: 'NPC Profit' },
	{ key: 'bazaarProfit', label: 'Bazaar Profit' },
] as const;

export const walkthroughSteps: Step[] = [
	{
		target: 'rates-controls',
		title: 'Configure Settings',
		description:
			'Set your farming fortune, duration, reforge, pet, BPS, and bazaar mode. Leave fortune blank for max fortune.',
		position: 'bottom',
	},
	{
		target: 'rates-results',
		title: 'Compare Crops',
		description: 'View NPC and Bazaar profits for every crop. Click any row to see a detailed breakdown.',
		position: 'top',
	},
	{
		target: 'rates-faq',
		title: 'FAQ',
		description: 'Common questions about rates and how the calculator works.',
		position: 'top',
	},
];

export const faqItems = [
	{
		question: 'What does this calculator do?',
		answer: 'It estimates how much you can collect and earn with your chosen farming fortune, gear, and farming time. You can compare profits from selling to an NPC or on the Bazaar.',
	},
	{
		question: 'What does leaving fortune blank do?',
		answer: 'Leaving fortune blank uses the theoretical maximum for each crop, including maxed gear, enchantments, and equipment. Enter your own fortune to estimate rates for your setup.',
	},
	{
		question: 'What is BPS?',
		answer: 'BPS means blocks broken per second. The maximum is 20. Choose a lower value if you break fewer blocks so the estimate better reflects your farming speed.',
	},
	{
		question: "What's the difference between Sell Order and Insta-Sell?",
		answer: 'Sell Order uses averaged sell-order prices and assumes you wait for your orders to fill. Insta-Sell uses averaged instant-sell prices for selling directly to existing buy orders. Actual sale prices can change with the market.',
	},
	{
		question: 'How do I see where the coins come from?',
		answer: 'Select a crop in the table or crop selector to see its NPC profit, Bazaar profit, and collection breakdowns. Select the same crop again in the crop selector to return to all crops.',
	},
	{
		question: 'Why am I getting less profit than this shows?',
		answer: 'The default settings assume maxed gear and uninterrupted farming. Enter your own fortune and farming speed for a closer estimate. Your fortune can also differ between crops, so use the value for the crop you want to compare.',
	},
	{
		question: 'Can I use this for pest farming?',
		answer: "The calculator does not include pest drops or time spent handling pests, so it won't estimate your total pest-farming profit. You can still compare crop rates to help choose what to farm between pest spawns.",
	},
];
