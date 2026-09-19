import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Farming tools',
		description: 'Plan your farming setup with rates, fortune, composter, mutation, and progress calculators.',
		image: '/favicon.webp',
	};
}
