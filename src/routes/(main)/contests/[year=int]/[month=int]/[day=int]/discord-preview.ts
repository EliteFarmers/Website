import type { JacobContestDto } from '$lib/api';
import { previewCrop, previewNumber, type PreviewCard } from '$lib/discord-preview';

export function createPreview(data: {
	year: number;
	month: number;
	day: number;
	timestamp: number;
	contests: JacobContestDto[];
}): PreviewCard {
	return {
		title: 'Jacob’s Contest • ' + data.year + '/' + data.month + '/' + data.day,
		description: 'Crop results and medal brackets for this contest.',
		lines: [
			'<t:' + data.timestamp + ':f>',
			...data.contests
				.slice(0, 3)
				.map(
					(contest) =>
						'**' +
						previewCrop(contest.crop) +
						'** • ' +
						previewNumber(contest.participants) +
						' participants'
				),
		],
	};
}
