<script lang="ts">
	import { PUBLIC_GTAG_MEASUREMENT_ID } from '$env/static/public';
	import { onMount } from 'svelte';
	import CookieConsent from './cookie-consent.svelte';

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
</svelte:head>

{#if PUBLIC_GTAG_MEASUREMENT_ID}
	<CookieConsent />
{/if}
