import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Writing an Elite guide',
		description: 'How to share your farming knowledge and farm designs with the community.',
		image: '/favicon.webp',
	};
}
