import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'SkyBlock Gems & Firesales',
		description: 'Explore SkyBlock Gem packages, firesales, Taylor’s collection, and seasonal bundles.',
		image: '/favicon.webp',
	};
}
