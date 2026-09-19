import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'SkyBlock guilds',
		description: 'Explore guild rankings and compare the farming progress of their members.',
		image: '/favicon.webp',
	};
}
