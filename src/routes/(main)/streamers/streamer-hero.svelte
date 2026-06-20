<script lang="ts">
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { Button } from '$ui/button';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { getStreamTitle, getTwitchHref } from './streamer-utils';
	import TwitchEmbed from './twitch-embed.svelte';
	import LiveViewCount from './live-view-count.svelte';
	import type { StreamerDirectoryItem } from '$lib/remote/streamers.remote';

	interface Props {
		item: StreamerDirectoryItem;
	}

	let { item }: Props = $props();
	const title = $derived(getStreamTitle(item));
	const twitchHref = $derived(getTwitchHref(item.twitchLogin));
</script>

<section
	class="bg-card grid w-full max-w-7xl overflow-hidden rounded-md border shadow-sm lg:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.85fr)]"
>
	<TwitchEmbed channel={item.twitchLogin} title="{item.displayName} Twitch stream" frame={false} />
	<div class="flex min-w-0 flex-col justify-between gap-5 border-t p-5 lg:border-t-0 lg:border-l">
		<div class="flex flex-col gap-4">
			<LiveViewCount viewerCount={item.liveStream?.viewerCount} />
			<div class="flex min-w-0 items-center gap-3">
				{#if item.streamer?.minecraftUuid}
					<PlayerHead uuid={item.streamer.minecraftUuid} size="2xl" class="shrink-0" />
				{/if}
				<div class="min-w-0">
					<h2 class="truncate text-3xl font-bold tracking-normal sm:text-4xl">{item.displayName}</h2>
					<p class="text-muted-foreground mt-1 truncate">@{item.twitchLogin}</p>
				</div>
			</div>
			<p class="line-clamp-5 text-base leading-7">{title}</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button href={item.href}>View Profile</Button>
			<Button href={twitchHref} target="_blank" rel="noreferrer" variant="outline">
				<ExternalLink class="size-4" />
				Twitch
			</Button>
		</div>
	</div>
</section>
