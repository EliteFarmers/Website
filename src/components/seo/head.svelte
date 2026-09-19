<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { buildDiscordPreview, type PreviewCard } from '$lib/discord-preview';
	import HeadLdJson from '../head-ld-json.svelte';

	export interface Props {
		title: string | undefined; // 'Elite | Skyblock Farming Weight';
		keywords?: string | undefined;
		imageUrl?: string | undefined;
		description: string;
		children?: import('svelte').Snippet;
		canonicalPath?: string;
		twitterCardType?: 'summary' | 'summary_large_image' | 'app' | 'player' | undefined;
		ldJson?: unknown;
		noindex?: boolean;
		discordPreview?: PreviewCard | null;
	}

	let {
		title,
		keywords = 'farming, profile, skyblock, weight, calculate, Hypixel, elite, leaderboards, skyblock leaderboards',
		imageUrl = `${env.PUBLIC_HOST_URL}/favicon.webp`,
		description,
		children,
		twitterCardType,
		canonicalPath,
		ldJson = undefined,
		noindex = false,
		discordPreview = null,
	}: Props = $props();

	const pageCtx = getPageCtx();

	const canonicalRoot = $derived(env.PUBLIC_CANONICAL_URL || env.PUBLIC_HOST_URL || page.url.origin);
	const discordJson = $derived.by(() => {
		if (!discordPreview || page.status !== 200) return null;
		try {
			const url = new URL(page.url.pathname + page.url.search, canonicalRoot);
			return buildDiscordPreview(discordPreview, { url, path: url.pathname + url.search });
		} catch {
			return null;
		}
	});

	const canonicalUrl = $derived.by(() => {
		if (canonicalPath) {
			const isFullUrl = canonicalPath.startsWith('http');

			if (isFullUrl) {
				return env.PUBLIC_CANONICAL_URL
					? canonicalPath.replace(env.PUBLIC_HOST_URL, env.PUBLIC_CANONICAL_URL)
					: canonicalPath;
			}

			return canonicalRoot + (canonicalPath.startsWith('/') ? '' : '/') + canonicalPath;
		}

		return canonicalRoot + page.url.pathname;
	});

	const imgUrl = $derived(
		imageUrl?.startsWith('http')
			? imageUrl
			: env.PUBLIC_HOST_URL + (imageUrl?.startsWith('/') ? '' : '/') + imageUrl
	);

	$effect(() => {
		pageCtx.title = title ?? 'Elite | Skyblock Farming Weight';
	});
</script>

<svelte:head>
	<title>{title || pageCtx.title}</title>
	<meta property="og:title" content={title || pageCtx.title} />
	<meta property="twitter:title" content={title || pageCtx.title} />
	<meta property="og:site_name" content="Elite Skyblock" />

	{#if noindex}
		<meta name="robots" content="noindex" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}

	<meta property="twitter:card" content={twitterCardType ?? 'summary'} />

	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
		<meta property="twitter:description" content={description} />
	{/if}

	<meta name="keywords" content={keywords} />

	{#if imgUrl}
		<meta property="twitter:image" content={imgUrl} />
		<meta property="og:image" content={imgUrl} />
	{/if}

	<meta property="og:url" content={canonicalUrl} />
	<link rel="canonical" href={canonicalUrl} />

	{#if ldJson}
		<HeadLdJson content={ldJson} />
	{/if}

	{#if discordJson}
		<svelte:element this={"script"} id="discord:component-embed" type="application/json">
			{discordJson}
		</svelte:element>
	{/if}

	{@render children?.()}
</svelte:head>
