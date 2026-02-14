<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import CookieConsent from './cookie-consent.svelte';
	import { ADDITIONAL_TAGS } from './tag-config';
	const { PUBLIC_GTAG_MEASUREMENT_ID } = env;

	onMount(() => {
		if (PUBLIC_GTAG_MEASUREMENT_ID) {
			window.gtag('config', PUBLIC_GTAG_MEASUREMENT_ID);
		}
	});
</script>

<svelte:head>
	{#if PUBLIC_GTAG_MEASUREMENT_ID}
		<script async src="https://www.googletagmanager.com/gtag/js?id={PUBLIC_GTAG_MEASUREMENT_ID}"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag() {
				dataLayer.push(arguments);
			}
			gtag('js', new Date());
			window.gtag = gtag;
		</script>
	{/if}
	{#if ADDITIONAL_TAGS && ADDITIONAL_TAGS.length > 0}
		{#each ADDITIONAL_TAGS as tag, i (i)}
			{#if tag.condition === undefined || tag.condition(page.data)}
				<!-- eslint-disable-next-line -->
				{@html tag.content}
			{/if}
		{/each}
	{/if}
</svelte:head>

{#if PUBLIC_GTAG_MEASUREMENT_ID}
	<CookieConsent />
{/if}
