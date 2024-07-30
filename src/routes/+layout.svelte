<script lang="ts">
	import { page } from '$app/stores';
	import { getAnyCropSelected, initAnyCropSelected, initSelectedCrops } from '$lib/stores/selectedCrops';
	import { initRatesData } from '$lib/stores/ratesData';

	import '../app.pcss';

	import Nav from '$comp/header/nav.svelte';
	import Footer from '$comp/footer/footer.svelte';

	import { ModeWatcher, mode } from 'mode-watcher';
	import { settings, getSettings } from 'svelte-ux';

	initAnyCropSelected();
	initSelectedCrops(getAnyCropSelected());
	initRatesData();

	mode.subscribe((value) => {
		if (!value) return;

		const settings = getSettings();
		settings.currentTheme.setTheme(value);
	});

	settings({
		themes: {
			light: ['light'],
			dark: ['dark'],
		},
	});
</script>

<svelte:head>
	<meta name="author" content="Kaeso" />
	<meta name="robots" content="index, follow" />
	<meta property="og:url" content={$page.url.toString()} />
</svelte:head>
<ModeWatcher />

<div class="relative flex flex-col min-h-screen">
	<Nav />

	<div class="flex-1">
		<slot />
	</div>

	<Footer />
</div>
