import { query } from '$app/server';
import {
	getLiveStreams,
	getStreamer,
	listStreamers,
	type StreamAPIModelsLiveStreamDto,
	type StreamAPIModelsStreamerProfileDto,
	type StreamAPIModelsStreamerProfileResponse,
} from '$lib/stream-api';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export type StreamerDirectoryItem = {
	kind: 'registered' | 'discovered';
	key: string;
	streamer: StreamAPIModelsStreamerProfileDto | null;
	liveStream: StreamAPIModelsLiveStreamDto | null;
	twitchLogin: string;
	displayName: string;
	href: string;
	external: boolean;
};

export type StreamerDirectoryModel = {
	hero: StreamerDirectoryItem | null;
	promotedLive: StreamerDirectoryItem[];
	discoveredLive: StreamerDirectoryItem[];
	registeredOffline: StreamerDirectoryItem[];
	serviceUnavailable: boolean;
};

export const getStreamerDirectory = query(async (): Promise<StreamerDirectoryModel> => {
	const [registeredResult, liveResult] = await Promise.all([
		listStreamers().catch(() => null),
		getLiveStreams({ limit: 200 }).catch(() => null),
	]);

	const serviceUnavailable = !registeredResult?.ok || !liveResult?.ok;
	const registeredProfiles = registeredResult?.ok ? (registeredResult.data.streamers ?? []) : [];
	const liveStreams = liveResult?.ok ? dedupeLiveStreams(liveResult.data.streams ?? []) : [];

	const registeredLiveKeys = new Set<string>();
	const registeredItems = registeredProfiles
		.map(toRegisteredItem)
		.filter((item): item is StreamerDirectoryItem => Boolean(item));

	for (const item of registeredItems) {
		if (!item.liveStream) continue;
		addLiveKeys(registeredLiveKeys, item.liveStream);
	}

	const liveRegistered = registeredItems.filter((item) => item.liveStream);
	const sortedLiveRegistered = [...liveRegistered].sort(comparePromotedLive);
	const hero = sortedLiveRegistered[0] ?? null;
	const promotedLive = sortedLiveRegistered.filter((item) => item !== hero);

	const discoveredLive = liveStreams
		.filter((stream) => !stream.streamer && !hasLiveKey(registeredLiveKeys, stream))
		.map(toDiscoveredItem)
		.filter((item): item is StreamerDirectoryItem => Boolean(item))
		.sort((a, b) => compareViewerCount(a.liveStream, b.liveStream));

	const registeredOffline = registeredItems
		.filter((item) => !item.liveStream)
		.sort((a, b) => comparePriority(a.streamer, b.streamer) || a.displayName.localeCompare(b.displayName));

	return {
		hero,
		promotedLive,
		discoveredLive,
		registeredOffline,
		serviceUnavailable,
	};
});

export const getStreamerProfile = query(z.string().min(1), async (twitchLogin): Promise<StreamerProfileResponse> => {
	const result = await getStreamer(twitchLogin).catch(() => null);

	if (!result?.ok) {
		const status = result?.response.status;
		error(status === 404 ? 404 : 502, status === 404 ? 'Streamer not found' : 'Stream service unavailable');
	}

	if (!result.data.streamer) {
		error(404, 'Streamer not found');
	}

	return result.data;
});

function toRegisteredItem(profile: StreamerProfileResponse): StreamerDirectoryItem | null {
	if (!profile.streamer?.twitchLogin) return null;
	const displayName = getStreamerDisplayName(profile.streamer);

	return {
		kind: 'registered',
		key: `registered:${profile.streamer.id?.toString() ?? profile.streamer.twitchLogin.toLowerCase()}`,
		streamer: profile.streamer,
		liveStream: profile.liveStream ?? null,
		twitchLogin: profile.streamer.twitchLogin,
		displayName,
		href: `/streamers/${encodeURIComponent(profile.streamer.twitchLogin)}`,
		external: false,
	};
}

function toDiscoveredItem(stream: StreamAPIModelsLiveStreamDto): StreamerDirectoryItem | null {
	if (!stream.providerLogin) return null;
	const displayName = stream.providerDisplayName || stream.providerLogin;

	return {
		kind: 'discovered',
		key: `discovered:${getPrimaryLiveKey(stream)}`,
		streamer: null,
		liveStream: stream,
		twitchLogin: stream.providerLogin,
		displayName,
		href: stream.url || `https://www.twitch.tv/${stream.providerLogin}`,
		external: true,
	};
}

function comparePromotedLive(a: StreamerDirectoryItem, b: StreamerDirectoryItem) {
	return (
		comparePriority(a.streamer, b.streamer) ||
		compareViewerCount(a.liveStream, b.liveStream) ||
		a.displayName.localeCompare(b.displayName)
	);
}

function comparePriority(
	a: StreamAPIModelsStreamerProfileDto | null | undefined,
	b: StreamAPIModelsStreamerProfileDto | null | undefined
) {
	const aPriority = a?.priority;
	const bPriority = b?.priority;

	if (aPriority == null && bPriority == null) return 0;
	if (aPriority == null) return 1;
	if (bPriority == null) return -1;
	return aPriority - bPriority;
}

function compareViewerCount(
	a: StreamAPIModelsLiveStreamDto | null | undefined,
	b: StreamAPIModelsLiveStreamDto | null | undefined
) {
	return (b?.viewerCount ?? 0) - (a?.viewerCount ?? 0);
}

function getStreamerDisplayName(streamer: StreamAPIModelsStreamerProfileDto) {
	return streamer.twitchDisplayName || streamer.twitchLogin || 'Streamer';
}

function addLiveKeys(keys: Set<string>, stream: StreamAPIModelsLiveStreamDto) {
	for (const key of getLiveKeys(stream)) keys.add(key);
}

function hasLiveKey(keys: Set<string>, stream: StreamAPIModelsLiveStreamDto) {
	return getLiveKeys(stream).some((key) => keys.has(key));
}

function getLiveKeys(stream: StreamAPIModelsLiveStreamDto) {
	return [
		stream.providerUserId ? `id:${stream.providerUserId}` : null,
		stream.providerLogin ? `login:${stream.providerLogin.toLowerCase()}` : null,
	].filter((key): key is string => Boolean(key));
}

function getPrimaryLiveKey(stream: StreamAPIModelsLiveStreamDto) {
	return getLiveKeys(stream)[0] ?? `stream:${stream.streamId ?? stream.providerLogin ?? stream.title ?? 'unknown'}`;
}

function dedupeLiveStreams(streams: StreamAPIModelsLiveStreamDto[]) {
	const selected: StreamAPIModelsLiveStreamDto[] = [];
	const selectedKeys = new Map<string, number>();

	for (const stream of streams) {
		const keys = getLiveKeys(stream);
		const existingIndex = keys.map((key) => selectedKeys.get(key)).find((index) => index !== undefined);

		if (existingIndex === undefined) {
			const nextIndex = selected.length;
			selected.push(stream);
			for (const key of keys) selectedKeys.set(key, nextIndex);
			continue;
		}

		if (isBetterLiveStream(stream, selected[existingIndex])) {
			selected[existingIndex] = stream;
			for (const key of keys) selectedKeys.set(key, existingIndex);
		}
	}

	return selected;
}

function isBetterLiveStream(candidate: StreamAPIModelsLiveStreamDto, existing: StreamAPIModelsLiveStreamDto) {
	const candidateObservedAt = Date.parse(candidate.lastObservedAt ?? '');
	const existingObservedAt = Date.parse(existing.lastObservedAt ?? '');
	if ((candidateObservedAt || 0) !== (existingObservedAt || 0)) {
		return (candidateObservedAt || 0) > (existingObservedAt || 0);
	}

	return (candidate.viewerCount ?? 0) > (existing.viewerCount ?? 0);
}

type StreamerProfileResponse = StreamAPIModelsStreamerProfileResponse;
