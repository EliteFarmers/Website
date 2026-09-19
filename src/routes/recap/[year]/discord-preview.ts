import type { PreviewCard } from '$lib/discord-preview';
export function createPreview({ year }: { year: string }): PreviewCard {
	return {
		title: year + ' SkyBlock Recap',
		description: 'Your farming progress, milestones, and highlights from the year.',
	};
}
