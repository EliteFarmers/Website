<script lang="ts">
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import type { StreamerDirectoryItem } from '$lib/remote/streamers.remote';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Radio from '@lucide/svelte/icons/radio';
	import { formatViewers, getStreamTitle, resolveThumbnail } from './streamer-utils';

	interface Props {
		item: StreamerDirectoryItem;
		showThumbnail?: boolean;
	}

	let { item, showThumbnail = true }: Props = $props();
	const thumbnail = $derived(resolveThumbnail(item.liveStream?.thumbnailUrl, 640, 360));
	const title = $derived(getStreamTitle(item));
	const isLive = $derived(Boolean(item.liveStream));
</script>

<a
	href={item.href}
	target={item.external ? '_blank' : undefined}
	rel={item.external ? 'noreferrer' : undefined}
	class="group bg-card hover:border-primary/50 flex h-full flex-col overflow-hidden rounded-md border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md {showThumbnail
		? 'min-h-64'
		: 'min-h-0'}"
>
	{#if showThumbnail}
		<div class="relative aspect-video w-full overflow-hidden bg-black">
			<img
				src={thumbnail}
				alt="{item.displayName} stream thumbnail"
				class="size-full object-cover transition duration-300 group-hover:scale-105"
				loading="lazy"
				width="640"
				height="360"
			/>
			<div class="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/80 to-transparent"></div>
			{#if isLive}
				<div
					class="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white shadow"
				>
					<Radio class="size-3" />
					LIVE
				</div>
				<div
					class="absolute right-2 bottom-2 rounded-md bg-black/75 px-2 py-1 text-xs font-semibold text-white"
				>
					{formatViewers(item.liveStream?.viewerCount)} viewers
				</div>
			{:else}
				<div class="absolute top-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white">
					Offline
				</div>
			{/if}
		</div>
	{/if}

	<div class="flex flex-1 flex-col gap-3 p-4">
		<div class="flex w-full min-w-0 items-start gap-2">
			{#if item.streamer?.minecraftUuid}
				<PlayerHead uuid={item.streamer.minecraftUuid} size="xl" class="mt-0.5 shrink-0" />
			{/if}
			<div class="min-w-0 flex-1">
				<h3 class="truncate text-lg font-semibold">{item.displayName}</h3>
				<p class="text-muted-foreground truncate text-sm">@{item.twitchLogin}</p>
			</div>
			{#if item.external}
				<ExternalLink class="text-muted-foreground mt-1 size-4 shrink-0" />
			{/if}
		</div>
		{#if title}
			<p class="line-clamp-3 text-sm leading-6">{title}</p>
		{/if}
	</div>
</a>
