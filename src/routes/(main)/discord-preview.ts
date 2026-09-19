import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Elite Skyblock',
		description:
			'The ultimate resource for Elite Skyblock players! Explore leaderboards, cheapest fortune upgrades, guides, and tools for all players and Farmers. ',
		image: '/favicon.webp',
		links: [
			{
				label: 'Home',
				path: '/',
			},
			{
				label: 'Leaderboards',
				path: '/leaderboards',
			},
			{
				label: 'Cheapest Upgrades',
				path: '/fortune',
			},
			{
				label: 'Tools',
				path: '/tools',
			},
		],
	};
}
