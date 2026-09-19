import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Farming Gain Tracker',
		description: 'Explore farming progress over time.',
	};
}
