import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Farming Fortune',
		description: 'View your Farming Fortune, rates, and cheapest fortune upgrades!',
		image: '/favicon.webp',
	};
}
