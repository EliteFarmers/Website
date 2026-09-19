import type { YearlyCropRecordsDto } from '$lib/api';
import type { PreviewCard } from '$lib/discord-preview';

export function createPreview(data: YearlyCropRecordsDto): PreviewCard {
	return {
		title: 'Year ' + data.year + ' Contest Records',
		description: 'The best Jacob’s Farming Contest performances of the SkyBlock year.',
	};
}
