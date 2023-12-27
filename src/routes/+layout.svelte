<script lang="ts">
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import { getAnyCropSelected, initAnyCropSelected, initSelectedCrops } from '$lib/stores/selectedCrops';
	import { initRatesData } from '$lib/stores/ratesData';

	import '../app.css';

	import Nav from '$comp/nav.svelte';
	import Footer from '$comp/footer.svelte';

	initAnyCropSelected();
	initSelectedCrops(getAnyCropSelected());
	initRatesData();
</script>

<svelte:head>
	<meta name="author" content="Kaeso" />
	<meta name="robots" content="index, follow" />
	<meta property="og:url" content={$page.url.toString()} />
</svelte:head>

<div class="bg-white dark:bg-zinc-900 relative min-h-screen pb-16 text-black dark:text-white">
	<Nav />

	{#if $navigating}
		<!-- Gray out the screen -->
		<div class="absolute z-[100] top-0 left-0 w-full h-[200vh] bg-gray-100 dark:bg-zinc-900 opacity-50" />
	{/if}

	<div>
		<slot />
	</div>

	<Footer />
</div>

<style lang="postcss">
	:global(html) {
		@apply bg-zinc-900;
	}
</style>
