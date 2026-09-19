import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Farming Rates Calculator',
		description: 'Compare farming profit and collection rates for your setup.',
	};
}
