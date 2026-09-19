import type { GlobalProgressSummaryResponse } from '$lib/api';
import { previewPest, previewStat, type PreviewCard } from '$lib/discord-preview';
import { STATS_RANGES, sumValues } from '$lib/tools/global-stats';

export function createPreview(data: {
	range: string;
	from?: number;
	to: number;
	summary: GlobalProgressSummaryResponse | null;
}): PreviewCard {
	const period = data.summary?.current;
	const range = STATS_RANGES.find((option) => option.value === data.range)?.label || '30 days';
	return {
		title: 'Global Stats • ' + range,
		description: 'Tracked coins generated, crop collection, pest kills, and skill XP across SkyBlock.',
		image: '/favicon.webp',
		lines: [
			data.from != null && '<t:' + data.from + ':d> – <t:' + data.to + ':d>',
			period && previewStat('coins generated (estimated NPC value)', period.totalNpcValue),
			period && previewStat('crops collected', sumValues(period.crops)),
			period && previewStat(previewPest('beetle', 'pests killed'), sumValues(period.pests)),
			period && previewStat('skill XP gained', sumValues(period.skills)),
		],
	};
}
