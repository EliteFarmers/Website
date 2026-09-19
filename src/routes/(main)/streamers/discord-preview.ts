import { previewText, type PreviewCard } from '$lib/discord-preview';
import type { StreamerDirectoryModel } from '$lib/remote/streamers.remote';

export function createPreview({ directory }: { directory: StreamerDirectoryModel }): PreviewCard {
	const live = [...(directory.hero ? [directory.hero] : []), ...directory.promotedLive, ...directory.discoveredLive];
	return {
		title: 'SkyBlock streamers',
		description: 'Find the Hypixel SkyBlock community live on Twitch.',
		lines: live.slice(0, 5).map((item) => '🔴 **' + previewText(item.displayName) + '**'),
	};
}
