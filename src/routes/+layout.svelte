<script lang="ts">
	import { page } from '$app/state';
	import { getAnyCropSelected, initAnyCropSelected, initSelectedCrops } from '$lib/stores/selectedCrops';
	import { initRatesData } from '$lib/stores/ratesData';
	import { initShowLeaderboardName } from '$lib/stores/leaderboardName';
	import * as Sidebar from '$ui/sidebar';
	import MainSideBar from '$comp/side-bar/main-side-bar.svelte';
	import { ModeWatcher, mode } from 'mode-watcher';
	import { settings, getSettings } from 'svelte-ux';
	import { browser } from '$app/environment';
	import { ScrollArea } from '$ui/scroll-area';
	import Nav from '$comp/header/nav.svelte';
	import Footer from '$comp/footer/footer.svelte';

	import '../app.pcss';
	
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	initAnyCropSelected();
	initSelectedCrops(getAnyCropSelected());
	initRatesData();
	initShowLeaderboardName();

	if (browser) {
		mode.subscribe((value) => {
			if (!value) return;

			const settings = getSettings();
			settings.currentTheme.setTheme(value);
		});
	}

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
	<meta property="og:url" content={page.url.toString()} />

	<link rel="dns-prefetch" href="https://assets.elitebot.dev/" />
	<link rel="dns-prefetch" href="https://cdn.discordapp.com/" />
</svelte:head>

<Sidebar.Provider>
	<MainSideBar />
	
	<ScrollArea class="flex-1 max-h-screen overflow-y-auto" scrollbarYClasses="pt-14">
		<Nav />

		<div>
			{@render children?.()}
		</div>

		<Footer />
	</ScrollArea>
</Sidebar.Provider>

<ModeWatcher />
