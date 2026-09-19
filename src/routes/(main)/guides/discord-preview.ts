import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'SkyBlock farming guides',
		description: 'Explore community-written guides and farm designs for your next farming upgrade.',
		image: '/favicon.webp',
	};
}
