<script lang="ts">
	import '../app.pcss';

	import { page } from '$app/state';
	import { getAnyCropSelected, initAnyCropSelected, initSelectedCrops } from '$lib/stores/selectedCrops';
	import { initRatesData } from '$lib/stores/ratesData';
	import { initShowLeaderboardName } from '$lib/stores/leaderboardName';
	import * as Sidebar from '$ui/sidebar';
	import { ModeWatcher, mode } from 'mode-watcher';
	import { settings, getSettings } from 'svelte-ux';
	import { browser } from '$app/environment';
	import { ScrollArea } from '$ui/scroll-area';
	import Footer from '$comp/footer/footer.svelte';
	import AppSidebar from '$comp/sidebar/app-sidebar.svelte';
	import { initBreadcrumb } from '$lib/hooks/breadcrumb.svelte';
	import { initSidebarNav } from '$lib/hooks/sidebar-nav.svelte';
	import Header from '$comp/header/header.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	initAnyCropSelected();
	initSelectedCrops(getAnyCropSelected());
	initRatesData();
	initShowLeaderboardName();
	initBreadcrumb();
	initSidebarNav();

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
	<AppSidebar />

	<Sidebar.Inset>
		<ScrollArea class="max-h-screen flex-1 overflow-y-auto" scrollbarYClasses="pt-16">
			<Header />

			<div>
				{@render children?.()}
			</div>

			<Footer />
		</ScrollArea>
	</Sidebar.Inset>
</Sidebar.Provider>

<ModeWatcher />
