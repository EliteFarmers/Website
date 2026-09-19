import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Guide submission rules',
		description: 'Learn how to write and submit a useful guide for the Elite community.',
		image: '/favicon.webp',
	};
}
