import { previewStat, type PreviewCard } from '$lib/discord-preview';
import type { StreamAPIModelsStreamerProfileResponse } from '$lib/stream-api';

export function createPreview({ profile }: { profile: StreamAPIModelsStreamerProfileResponse }): PreviewCard {
	const streamer = profile.streamer;
	return {
		title: streamer?.twitchDisplayName || streamer?.twitchLogin || 'SkyBlock streamer',
		description: profile.liveStream?.title || 'Watch SkyBlock streams and explore this creator’s profile.',
		lines: [
			profile.liveStream ? '🔴 **Live on Twitch**' : 'Currently offline',
			previewStat('viewers', profile.liveStream?.viewerCount),
		],
		links: streamer?.twitchLogin
			? [{ label: 'Watch on Twitch', path: 'https://www.twitch.tv/' + encodeURIComponent(streamer.twitchLogin) }]
			: undefined,
	};
}
