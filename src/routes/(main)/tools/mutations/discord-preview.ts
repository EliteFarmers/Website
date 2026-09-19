import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Mutation Copper Calculator',
		description: 'Compare mutation costs and copper rewards.',
	};
}
