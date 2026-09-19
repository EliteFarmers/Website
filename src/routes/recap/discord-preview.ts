import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Your SkyBlock recap',
		description: 'Revisit your year in SkyBlock and share your farming highlights.',
		image: '/favicon.webp',
	};
}
