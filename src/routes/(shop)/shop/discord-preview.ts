import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Elite Shop',
		description: 'Customize your profile with badges and styles, and support Elite with premium perks.',
		image: '/favicon.webp',
		links: [
			{
				label: 'Explore the shop',
				path: '/shop',
			},
		],
	};
}
