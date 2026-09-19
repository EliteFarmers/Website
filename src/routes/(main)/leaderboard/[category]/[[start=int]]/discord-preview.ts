import type { LeaderboardEntryDto } from '$lib/api';
import type { LeaderboardInfo } from '$lib/constants/leaderboards';
import {
	getDiscordCropEmoji,
	getDiscordPestEmoji,
	previewNumber,
	previewText,
	type PreviewCard,
} from '$lib/discord-preview';

export function createPreview(
	{ settings, lb }: { settings: LeaderboardInfo; lb?: { entries: LeaderboardEntryDto[] } },
	url: URL
): PreviewCard {
	const start = Math.max(1, Number(url.pathname.split('/').at(-1)) || 1);
	const filters = ['mode', 'interval'].map((key) => url.searchParams.get(key)).filter(Boolean);
	return {
		title: settings.title + ' Leaderboard',
		titleEmoji:
			getDiscordPestEmoji(settings.id === 'pests' ? 'beetle' : settings.id) ||
			getDiscordCropEmoji(settings.id.split('-')[0]),
		description: filters.length ? filters.join(' • ') : 'The leading players and profiles on Elite SkyBlock.',
		lines: lb?.entries
			.slice(0, 5)
			.map(
				(entry, index) =>
					'**#' +
					(start + index) +
					' ' +
					previewText(entry.ign || entry.profile || 'Co-op') +
					'** • ' +
					previewNumber(entry.amount)
			),
	};
}
