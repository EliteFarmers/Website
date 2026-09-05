import type { ContestBracketsDto } from '$lib/api';
import type { Step } from '$ui/walkthrough/ctx';

export const MONTHS_OPTIONS = [
	{ value: 1, label: '1 Month' },
	{ value: 4, label: '4 Months' },
	{ value: 8, label: '8 Months' },
	{ value: 12, label: '12 Months' },
];

export const MEDAL_BRACKETS: { key: keyof ContestBracketsDto; label: string; color: string }[] = [
	{ key: 'diamond', label: 'Diamond', color: 'text-cyan-400' },
	{ key: 'platinum', label: 'Platinum', color: 'text-emerald-400' },
	{ key: 'gold', label: 'Gold', color: 'text-yellow-400' },
	{ key: 'silver', label: 'Silver', color: 'text-gray-300' },
	{ key: 'bronze', label: 'Bronze', color: 'text-amber-700' },
];

export const walkthroughSteps: Step[] = [
	{
		target: 'jacob-controls',
		title: 'Settings',
		description: 'Adjust your BPS efficiency, toggle Mooshroom Mushroom inclusion, and choose a lookback period.',
		position: 'bottom',
	},
	{
		target: 'jacob-gold-tab',
		title: 'Gold medals',
		description:
			'Select a medal tab to view its average collection targets and fortune estimates, gold is selected here.',
		position: 'top',
	},
	{
		target: 'jacob-wheat-collection',
		title: 'Wheat collection target',
		description:
			'This is the average Wheat collection needed for Gold across the contests in your selected time range, aim to get higher than this amount!',
		position: 'top',
	},
	{
		target: 'jacob-wheat-fortune',
		title: 'Fortune needed for Wheat',
		description:
			'This estimates the farming fortune needed to reach that amount of collection during a full contest at your selected blocks per second.',
		position: 'top',
	},
	{
		target: 'jacob-faq',
		title: 'FAQ',
		description: 'Common questions about Jacob contests and how the requirements are calculated.',
		position: 'top',
	},
];

export const faqItems = [
	{
		question: 'Do I actually need this much fortune?',
		answer: 'On average, yes, but the fortune numbers shown here are just for normal crop farming. If you target pests and do greenhouse at during a contest, you can reach the needed collection with less fortune.',
	},
	{
		question: 'What is BPS?',
		answer: "BPS stands for blocks broken per second while farming, a perfect efficiency is 20/20. Lower efficiency means you'll need more fortune to reach the same medal cutoff.",
	},
	{
		question: 'What does the Mooshroom toggle do?',
		answer: 'It includes the bonus mushrooms collected with a Mooshroom Cow pet when estimating the fortune you need.',
	},
	{
		question: 'How does the month range affect results?',
		answer: 'The selected months determine the amount of contests are included in the average. A longer range smooths out differences between contests. A shorter range represents more recent medal cutoffs.',
	},
	{
		question: 'Why do some estimates show 0 fortune?',
		answer: 'At your selected farming speed, the estimate suggests you could reach that medal cutoff without any farming fortune bonus. This assumes you farm for the full contest and is common for bronze medal tiers.',
	},
];
