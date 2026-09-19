import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Jacob’s Farming Contests',
		description: 'Explore contest schedules, medal brackets, and farming records.',
		image: '/favicon.webp',
	};
}
