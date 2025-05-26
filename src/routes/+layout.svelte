<script lang="ts">
	import '../app.pcss';

	import { page } from '$app/state';
	import { getAnyCropSelected, initAnyCropSelected, initSelectedCrops } from '$lib/stores/selectedCrops';
	import { initRatesData } from '$lib/stores/ratesData';
	import * as Sidebar from '$ui/sidebar';
	import Footer from '$comp/footer/footer.svelte';
	import AppSidebar from '$comp/sidebar/app-sidebar.svelte';
	import { initBreadcrumb } from '$lib/hooks/breadcrumb.svelte';
	import { initSidebarNav } from '$lib/hooks/sidebar-nav.svelte';
	import Header from '$comp/header/header.svelte';
	import { initThemeContext } from '$lib/stores/themes.svelte';
	import Content from './content.svelte';
	import ThemeWatcher from '$comp/theme-watcher.svelte';
	import { Toaster } from '$ui/sonner';
	import { watch } from 'runed';
	import { toast } from 'svelte-sonner';
	import type { components } from '$lib/api/api';
	import { dev } from '$app/environment';
	import type { LayoutData } from './$types';
	import UpcomingEvents from '$comp/sidebar/upcoming-events.svelte';
	import { initFavoritesContext } from '$lib/stores/favorites.svelte';
	import FavoritedLinks from '$comp/sidebar/favorited-links.svelte';
	import FooterPills from '$comp/footer/footer-pills.svelte';

	interface Props {
		children?: import('svelte').Snippet;
		data: LayoutData;
	}

	let { children, data }: Props = $props();

	initThemeContext();
	initAnyCropSelected();
	initSelectedCrops(getAnyCropSelected());
	initRatesData();
	initFavoritesContext();
	initBreadcrumb();
	initSidebarNav();

	watch(
		() => page.form,
		() => {
			if (!page.form) return;

			if (page.form?.success) {
				toast.success('Success!', {
					duration: 5000,
					class: 'text-success',
				});
				return;
			}

			let problem = page.form.problem as components['schemas']['ErrorResponse'] | undefined;

			if (!problem && page.form?.error && typeof page.form.error === 'object') {
				problem = page.form.error as components['schemas']['ErrorResponse'];
			}

			if (problem) {
				if (dev) {
					console.error(problem);
				}
				toast.error(Object.values(problem.errors).join('\n') || problem.message, {
					duration: 5000,
					class: 'text-destructive',
				});
				return;
			}

			if (page.form?.error) {
				toast.error(page.form.error as string, {
					duration: 5000,
					class: 'text-destructive',
				});
				return;
			}
		}
	);
</script>

<svelte:head>
	<meta name="author" content="Kaeso" />
	<meta name="robots" content="index, follow" />
	<meta property="og:url" content={page.url.toString()} />

	<link rel="dns-prefetch" href="https://assets.elitebot.dev/" />
	<link rel="dns-prefetch" href="https://cdn.discordapp.com/" />
</svelte:head>

<ThemeWatcher />

<Sidebar.Provider open={data.sidebar}>
	<Sidebar.Root collapsible="icon" class="z-50">
		<AppSidebar>
			<FavoritedLinks />
			<UpcomingEvents events={data.cache?.events} />
		</AppSidebar>
	</Sidebar.Root>

	<div class="max-h-screen flex-1 overflow-y-auto">
		<Sidebar.Inset>
			<Header leaderboards={data.cache?.leaderboards?.leaderboards} />

			<Content>
				{@render children?.()}
				<FooterPills />
			</Content>

			<Footer />
		</Sidebar.Inset>
	</div>
</Sidebar.Provider>

<Toaster />
