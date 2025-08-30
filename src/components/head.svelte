<script lang="ts">
	import { PUBLIC_HOST_URL } from '$env/static/public';

	interface Props {
		title: string | undefined; // 'Elite | Skyblock Farming Weight';
		keywords?: string | false;
		imageUrl?: string | false;
		description: string;
		children?: import('svelte').Snippet;
	}

	let {
		title,
		keywords = 'farming, profile, skyblock, weight, calculate, Hypixel, elite, leaderboards, skyblock leaderboards',
		imageUrl = `${PUBLIC_HOST_URL}/favicon.webp`,
		description,
		children,
	}: Props = $props();
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
	{@render children?.()}
</svelte:head>
