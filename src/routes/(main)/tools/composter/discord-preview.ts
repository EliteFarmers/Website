import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(): PreviewCard {
	return {
		title: 'Composter Calculator',
		description: 'Plan composter upgrades and compare material costs.',
	};
}
