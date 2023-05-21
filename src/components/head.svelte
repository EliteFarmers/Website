<script lang="ts">
	import { PUBLIC_HOST_URL } from '$env/static/public';

	export let title: string | undefined; // 'Elite | Skyblock Farming Weight';
	export let keywords: string | false = 'farming, profile, skyblock, weight, calculate, Hypixel, elite';
	export let imageUrl: string | false = `${PUBLIC_HOST_URL}/favicon.webp`;
	export let description: string;
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
	<slot />
</svelte:head>
