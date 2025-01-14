<script lang="ts">
	import '../app.css';

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
	import { Separator } from '$ui/separator';
	import SearchMenu from '$comp/header/search-menu.svelte';
	import ModeToggle from '$comp/header/mode-toggle.svelte';
	import NavBreadcrumb from '$comp/sidebar/nav-breadcrumb.svelte';
	import { initBreadcrumb } from '$lib/hooks/breadcrumb.svelte';
	import { initSidebarNav } from '$lib/hooks/sidebar-nav.svelte';

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
			<header
				class="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4"
			>
				<div class="flex flex-1 flex-row items-center gap-2">
					<Sidebar.Trigger class="-my-2 -ml-2 size-10" />
					<Separator orientation="vertical" class="mr-2 h-4" />
					<NavBreadcrumb />
				</div>
				<div class="flex items-center justify-between gap-4 md:justify-end">
					<div class="w-full flex-1 md:w-auto md:flex-none">
						<SearchMenu />
					</div>
					<div class="flex items-center gap-2">
						<ModeToggle />
						<!-- <UserDropdown /> -->
					</div>
				</div>
			</header>

			<div>
				{@render children?.()}
			</div>

			<Footer />
		</ScrollArea>
	</Sidebar.Inset>
</Sidebar.Provider>

<ModeWatcher />
