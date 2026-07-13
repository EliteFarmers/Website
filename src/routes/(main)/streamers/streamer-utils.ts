import type { StreamerDirectoryItem } from '$lib/remote/streamers.remote';
import type { StreamAPIModelsLiveStreamDto, StreamAPIModelsStreamerProfileDto } from '$lib/stream-api';

const numberFormatter = new Intl.NumberFormat('en-US');

export function resolveThumbnail(url?: string | null, width = 640, height = 360) {
	if (!url) return '/favicon.webp';
	return url.replaceAll('{width}', width.toString()).replaceAll('{height}', height.toString());
}

export function getDisplayName(
	streamer?: StreamAPIModelsStreamerProfileDto | null,
	stream?: StreamAPIModelsLiveStreamDto | null
) {
	return (
		streamer?.twitchDisplayName ||
		streamer?.twitchLogin ||
		stream?.providerDisplayName ||
		stream?.providerLogin ||
		'Streamer'
	);
}

export function getTwitchHref(login?: string | null) {
	return login ? `https://www.twitch.tv/${login}` : 'https://www.twitch.tv/directory/category/minecraft';
}

export function getStreamTitle(item: StreamerDirectoryItem) {
	return item.liveStream?.title || item.streamer?.aboutMarkdown;
}

export function formatViewers(value?: number | null) {
	return numberFormatter.format(value ?? 0);
}

export function getCreatorCodes(streamer?: StreamAPIModelsStreamerProfileDto | null) {
	return [
		streamer?.eliteCreatorCode ? { label: 'Elite Shop', value: streamer.eliteCreatorCode } : null,
		streamer?.hypixelCreatorCode ? { label: 'Hypixel Store', value: streamer.hypixelCreatorCode } : null,
	].filter((code): code is { label: string; value: string } => Boolean(code));
}
