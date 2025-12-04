<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_HOST_URL } from '$env/static/public';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import HeadLdJson from './head-ld-json.svelte';

	interface Props {
		title: string | undefined; // 'Elite | Skyblock Farming Weight';
		keywords?: string | undefined;
		imageUrl?: string | undefined;
		description: string;
		children?: import('svelte').Snippet;
		canonicalPath?: string;
		twitterCardType?: 'summary' | 'summary_large_image' | 'app' | 'player' | undefined;
		ldJson?: unknown;
	}

	let {
		title,
		keywords = 'farming, profile, skyblock, weight, calculate, Hypixel, elite, leaderboards, skyblock leaderboards',
		imageUrl = `${PUBLIC_HOST_URL}/favicon.webp`,
		description,
		children,
		twitterCardType,
		canonicalPath,
		ldJson = undefined,
	}: Props = $props();

	const pageCtx = getPageCtx();

	const canonicalUrl = $derived(
		canonicalPath?.startsWith('http')
			? canonicalPath
			: PUBLIC_HOST_URL + (canonicalPath?.startsWith('/') ? '' : '/') + canonicalPath
	);

	$effect(() => {
		pageCtx.title = title ?? 'Elite | Skyblock Farming Weight';
	});
</script>

<svelte:head>
	<title>{pageCtx.title}</title>
	<meta property="og:title" content={pageCtx.title} />

	<meta property="twitter:card" content={twitterCardType ?? 'summary'} />

	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
		<meta property="twitter:description" content={description} />
	{/if}

	<meta name="keywords" content={keywords} />

	{#if imageUrl}
		<meta property="twitter:image" content={imageUrl} />
		<meta property="og:image" content={imageUrl} />
	{/if}

	{#if canonicalPath}
		<meta property="og:url" content={canonicalUrl ?? page.url.toString()} />
		<link rel="canonical" href={canonicalUrl} />
	{/if}

	{#if ldJson}
		<HeadLdJson content={ldJson} />
	{/if}

	{@render children?.()}
</svelte:head>
