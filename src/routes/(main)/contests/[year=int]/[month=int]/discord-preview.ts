import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(data: { year: number; month: number }): PreviewCard {
	return {
		title: 'Jacob’s Contests • Year ' + data.year + ', Month ' + data.month,
		description: 'Explore contest results and medal brackets for this SkyBlock month.',
	};
}
