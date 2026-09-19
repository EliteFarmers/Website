import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'SkyBlock leaderboards',
		description: 'See who leads in farming weight, crop collections, skills, and more.',
		image: '/favicon.webp',
	};
}
