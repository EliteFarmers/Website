<script lang="ts">
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import RenderMd from '$comp/markdown/render-md.svelte';
	import Head from '$comp/seo/head.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import { SiDiscord, SiYoutube } from '@icons-pack/svelte-simple-icons';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import LinkIcon from '@lucide/svelte/icons/link';
	import Radio from '@lucide/svelte/icons/radio';
	import Shirt from '@lucide/svelte/icons/shirt';
	import Tags from '@lucide/svelte/icons/tags';
	import User from '@lucide/svelte/icons/user';
	import LiveViewCount from '../live-view-count.svelte';
	import { getCreatorCodes, getDisplayName, getTwitchHref, resolveThumbnail } from '../streamer-utils';
	import TwitchEmbed from '../twitch-embed.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const streamer = $derived(data.profile.streamer);
	const liveStream = $derived(data.profile.liveStream);
	const displayName = $derived(getDisplayName(streamer, liveStream));
	const twitchLogin = $derived(streamer?.twitchLogin ?? liveStream?.providerLogin ?? '');
	const twitchHref = $derived(getTwitchHref(twitchLogin));
	const imageUrl = $derived(resolveThumbnail(liveStream?.thumbnailUrl, 1200, 630));
	const codes = $derived(getCreatorCodes(streamer));
	const links = $derived([...(streamer?.links ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
	const minecraftName = $derived(data.minecraftName);

	const pageCtx = getPageCtx();
	const crumbs = $derived<Crumb[]>([
		{ name: 'Streamers', href: '/streamers' },
		{ name: displayName, href: `/streamers/${twitchLogin}` },
	]);

	$effect(() => {
		pageCtx.setBreadcrumbs(crumbs);
	});

	function getLinkKind(kind?: string | null, url?: string | null) {
		const value = `${kind ?? ''} ${url ?? ''}`.toLowerCase();
		if (value.includes('youtube') || value.includes('youtu.be')) return 'youtube';
		if (value.includes('discord') || value.includes('discord.gg')) return 'discord';
		return 'generic';
	}
</script>

<Head
	title="{displayName} | SkyBlock Streamer"
	description={liveStream?.title ?? streamer?.aboutMarkdown ?? `${displayName} on Elite Skyblock.`}
	{imageUrl}
	canonicalPath="/streamers/{twitchLogin}"
/>

<main class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
	{#if liveStream && twitchLogin}
		<section class="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.75fr)]">
			<div class="bg-card overflow-hidden rounded-md border shadow-sm">
				<TwitchEmbed channel={twitchLogin} title="{displayName} Twitch stream" frame={false} />
			</div>
			<div class="bg-card flex flex-col justify-between gap-5 rounded-md border p-5 shadow-sm">
				<div class="flex flex-col gap-4">
					<div class="flex flex-wrap items-center gap-2">
						<Badge class="gap-1.5 bg-red-600 text-white">
							<Radio class="size-3" />
							LIVE
						</Badge>
						<LiveViewCount viewerCount={liveStream.viewerCount} />
					</div>
					<div class="flex min-w-0 items-center gap-3">
						{#if streamer?.minecraftUuid}
							<PlayerHead uuid={streamer.minecraftUuid} size="2xl" />
						{/if}
						<div class="min-w-0">
							<h1 class="truncate text-4xl font-bold tracking-normal">{displayName}</h1>
							<p class="text-muted-foreground mt-1 truncate">@{twitchLogin}</p>
						</div>
					</div>
					<p class="text-lg leading-7">{liveStream.title}</p>
				</div>
				<Button href={twitchHref} target="_blank" rel="noreferrer" variant="outline" class="w-fit">
					<ExternalLink class="size-4" />
					Twitch
				</Button>
			</div>
		</section>
	{:else}
		<header
			class="bg-card flex flex-col gap-5 rounded-md border p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="flex min-w-0 items-center gap-3">
				{#if streamer?.minecraftUuid}
					<PlayerHead uuid={streamer.minecraftUuid} size="2xl" />
				{/if}
				<div class="min-w-0">
					<h1 class="truncate text-4xl font-bold tracking-normal">{displayName}</h1>
					<p class="text-muted-foreground mt-1 truncate">@{twitchLogin}</p>
				</div>
			</div>
			<Button href={twitchHref} target="_blank" rel="noreferrer" variant="outline" class="w-fit">
				<ExternalLink class="size-4" />
				Twitch
			</Button>
		</header>
	{/if}

	<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
		<section class="bg-card flex min-w-0 flex-col gap-4 rounded-md border p-6 shadow-sm">
			<div class="flex items-center gap-2">
				<User class="text-muted-foreground size-5" />
				<h2 class="text-2xl font-semibold">About</h2>
			</div>
			{#if streamer?.aboutMarkdown}
				<div class="prose prose-sm dark:prose-invert max-w-none">
					<RenderMd content={streamer.aboutMarkdown} />
				</div>
			{:else}
				<p class="text-muted-foreground">This streamer has not added an about section yet.</p>
			{/if}
		</section>

		<aside class="flex flex-col gap-4">
			{#if links.length > 0}
				<section class="bg-card flex flex-col gap-3 rounded-md border p-5 shadow-sm">
					<div class="flex items-center gap-2">
						<LinkIcon class="text-muted-foreground size-5" />
						<h2 class="text-xl font-semibold">Links</h2>
					</div>
					<div class="flex flex-col gap-2">
						{#each links as link (link.id ?? link.url)}
							{@const linkKind = getLinkKind(link.kind, link.url)}
							<Button
								href={link.url}
								target="_blank"
								rel="noreferrer"
								variant="outline"
								class="justify-between"
							>
								<span class="truncate">{link.label || link.kind || link.url}</span>
								{#if linkKind === 'youtube'}
									<SiYoutube class="size-4" />
								{:else if linkKind === 'discord'}
									<SiDiscord class="size-4" />
								{:else}
									<ExternalLink class="size-4" />
								{/if}
							</Button>
						{/each}
					</div>
				</section>
			{/if}

			{#if codes.length > 0}
				<section class="bg-card flex flex-col gap-3 rounded-md border p-5 shadow-sm">
					<div class="flex items-center gap-2">
						<Tags class="text-muted-foreground size-5" />
						<h2 class="text-xl font-semibold">Creator Codes</h2>
					</div>
					<div class="flex flex-col gap-2">
						{#each codes as code (code.label)}
							<div class="flex flex-row items-center gap-2 rounded-md border p-3">
								<div class="flex-1">
									<p class="text-muted-foreground text-sm">{code.label}</p>
									<p class="font-mono text-lg font-semibold">{code.value}</p>
								</div>
								<CopyToClipboard text={code.value} />
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if streamer?.minecraftUuid}
				<section class="bg-card flex flex-col gap-3 rounded-md border p-5 shadow-sm">
					<div class="flex items-center gap-2">
						<Shirt class="text-muted-foreground size-5" />
						<h2 class="text-xl font-semibold">Minecraft</h2>
					</div>
					<p class="text-lg font-semibold">{minecraftName ?? 'Linked Minecraft account'}</p>
					<Button href="/@{streamer.minecraftUuid}" variant="outline">View Profile</Button>
				</section>
			{/if}
		</aside>
	</div>
</main>
