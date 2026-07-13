<script lang="ts">
	import { env } from '$env/dynamic/public';

	const { PUBLIC_UMAMI_SCRIPT_URL, PUBLIC_UMAMI_WEBSITE_ID } = env;
</script>

<svelte:head>
	{#if PUBLIC_UMAMI_SCRIPT_URL && PUBLIC_UMAMI_WEBSITE_ID}
		<script defer src={PUBLIC_UMAMI_SCRIPT_URL} data-website-id={PUBLIC_UMAMI_WEBSITE_ID}></script>
	{/if}
</svelte:head>
