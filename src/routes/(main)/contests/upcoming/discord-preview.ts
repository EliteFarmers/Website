import type { YearlyContestsDto } from '$lib/api';
import { previewCrop, type PreviewCard } from '$lib/discord-preview';

export function createPreview(data: YearlyContestsDto): PreviewCard {
	const now = Date.now() / 1000;
	const upcoming = Object.entries(data.contests)
		.filter(([timestamp]) => Number(timestamp) >= now)
		.sort((a, b) => Number(a[0]) - Number(b[0]))
		.slice(0, 5);
	return {
		title: 'Upcoming Jacob’s Contests',
		description: 'SkyBlock Year ' + data.year,
		lines:
			upcoming.map(
				([timestamp, crops]) =>
					'<t:' + timestamp + ':R> • **' + crops.map((crop) => previewCrop(crop)).join(' • ') + '**'
			) || 'No upcoming contests reported yet!',
	};
}
