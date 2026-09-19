import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Contact Elite',
		description: 'Get in touch with the Elite SkyBlock team.',
		image: '/favicon.webp',
	};
}
