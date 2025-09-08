<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import FooterPills from '$comp/footer/footer-pills.svelte';
	import Footer from '$comp/footer/footer.svelte';
	import Announcements from '$comp/header/announcements.svelte';
	import Header from '$comp/header/header.svelte';
	import AppSidebar from '$comp/sidebar/app-sidebar.svelte';
	import FavoritedLinks from '$comp/sidebar/favorited-links.svelte';
	import UpcomingEvents from '$comp/sidebar/upcoming-events.svelte';
	import ThemeWatcher from '$comp/theme-watcher.svelte';
	import type { ErrorResponse } from '$lib/api';
	import { initGlobalContext } from '$lib/hooks/global.svelte';
	import { IsHover } from '$lib/hooks/is-hover.svelte';
	import { initPageContext } from '$lib/hooks/page.svelte';
	import { initFavoritesContext } from '$lib/stores/favorites.svelte';
	import { initRatesData } from '$lib/stores/ratesData';
	import { getAnyCropSelected, initAnyCropSelected, initSelectedCrops } from '$lib/stores/selectedCrops';
	import { initThemeContext } from '$lib/stores/themes.svelte';
	import * as Sidebar from '$ui/sidebar';
	import { Toaster } from '$ui/sonner';
	import { watch } from 'runed';
	import { setContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import '../app.css';
	import type { LayoutData } from './$types';
	import Content from './content.svelte';

	interface Props {
		children?: import('svelte').Snippet;
		data: LayoutData;
	}

	let { children, data }: Props = $props();

	let isHover = $state(new IsHover());
	setContext('isHover', isHover);

	initGlobalContext({ session: data.session, announcements: data.cache?.announcements ?? [] });
	initThemeContext();
	initAnyCropSelected();
	initSelectedCrops(getAnyCropSelected());
	initRatesData();
	initFavoritesContext();
	initPageContext();

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

			let problem = page.form.problem as ErrorResponse | undefined;

			if (!problem && page.form?.error && typeof page.form.error === 'object') {
				problem = page.form.error as ErrorResponse;
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

<svelte:boundary>
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
					<Announcements />
					{@render children?.()}
					<FooterPills />
				</Content>

				<Footer />
			</Sidebar.Inset>
		</div>
	</Sidebar.Provider>

	<Toaster />
	<ThemeWatcher />

	{#snippet pending()}
		<!-- Intentionally left blank -->
	{/snippet}
</svelte:boundary>
