import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Jacob’s Contest Fortune',
		description: 'Estimate the Farming Fortune needed for your target medal.',
	};
}
