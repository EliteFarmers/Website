import ChartNoAxesCombined from '@lucide/svelte/icons/chart-no-axes-combined';
import Coins from '@lucide/svelte/icons/coins';
import Medal from '@lucide/svelte/icons/medal';
import Recycle from '@lucide/svelte/icons/recycle';
import Sprout from '@lucide/svelte/icons/sprout';
import TrendingUp from '@lucide/svelte/icons/trending-up';

export const TOOL_PAGES = [
	{
		title: 'Global Stats',
		description: 'Explore the impact of farming on the global skyblock economy.',
		href: '/tools/global-stats',
		icon: ChartNoAxesCombined,
	},
	{
		title: 'Rates Calculator',
		description: 'Compare crop collection and profit for your farming setup.',
		href: '/tools/rates',
		icon: Coins,
	},
	{
		title: 'Crop Gain Tracker',
		description: 'Review daily crop gains, skill XP, and estimated playtime.',
		href: '/tools/gain',
		icon: TrendingUp,
	},
	{
		title: 'Jacob Contest Fortune',
		description: 'Find the farming fortune needed for each contest medal.',
		href: '/tools/jacob-fortune',
		icon: Medal,
	},
	{
		title: 'Mutation Copper',
		description: 'Compare mutation analysis costs per Copper.',
		href: '/tools/mutations',
		icon: Sprout,
	},
	{
		title: 'Composter Calculator',
		description: 'Compare inputs, upgrades, Compost output, and profit.',
		href: '/tools/composter',
		icon: Recycle,
	},
] as const;
