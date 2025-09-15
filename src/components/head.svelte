<script lang="ts">
	import { PUBLIC_HOST_URL } from '$env/static/public';

	interface Props {
		title: string | undefined; // 'Elite | Skyblock Farming Weight';
		keywords?: string | false;
		imageUrl?: string | false;
		description: string;
		children?: import('svelte').Snippet;
		canonicalPath?: string;
	}

	let {
		title,
		keywords = 'farming, profile, skyblock, weight, calculate, Hypixel, elite, leaderboards, skyblock leaderboards',
		imageUrl = `${PUBLIC_HOST_URL}/favicon.webp`,
		description,
		children,
		canonicalPath,
	}: Props = $props();

	const canonicalUrl = $derived(
		canonicalPath?.startsWith('http')
			? canonicalPath
			: PUBLIC_HOST_URL + (canonicalPath?.startsWith('/') ? '' : '/') + canonicalPath
	);
</script>

<svelte:head>
	{#if title}
		<title>{title}</title>
		<meta property="og:title" content={title} />
	{/if}
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
	{#if keywords}
		<meta name="keywords" content={keywords} />
	{/if}
	{#if imageUrl}
		<meta property="og:image" content={imageUrl} />
	{/if}
	{#if canonicalPath}
		<link rel="canonical" href={canonicalUrl} />
	{/if}
	{@render children?.()}
</svelte:head>
