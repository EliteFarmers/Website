import { getDiscordPestEmoji, type PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Pest farming',
		titleEmoji: getDiscordPestEmoji('beetle'),
		description: 'View pest farming stats, vacuum progress, and pest-focused upgrades for any SkyBlock player.',
		image: '/favicon.webp',
	};
}
