import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'SkyBlock farming news',
		description: 'Updates, articles, and insights from the Elite SkyBlock community.',
		image: '/favicon.webp',
	};
}
