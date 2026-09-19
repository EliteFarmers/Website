import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'The Elite community',
		description: 'Discover farming events and Discord communities for Hypixel SkyBlock.',
		image: '/favicon.webp',
	};
}
