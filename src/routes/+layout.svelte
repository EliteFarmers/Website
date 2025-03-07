<script lang="ts">
	import '../app.pcss';

	import { page } from '$app/state';
	import { getAnyCropSelected, initAnyCropSelected, initSelectedCrops } from '$lib/stores/selectedCrops';
	import { initRatesData } from '$lib/stores/ratesData';
	import { initShowLeaderboardName } from '$lib/stores/leaderboardName';
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

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	initThemeContext();
	initAnyCropSelected();
	initSelectedCrops(getAnyCropSelected());
	initRatesData();
	initShowLeaderboardName();
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
			if (problem) {
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

<Sidebar.Provider>
	<Sidebar.Root collapsible="icon" class="z-50">
		<AppSidebar />
	</Sidebar.Root>

	<div class="max-h-screen flex-1 overflow-y-auto">
		<Sidebar.Inset>
			<Header />

			<Content>
				{@render children?.()}
			</Content>

			<Footer />
		</Sidebar.Inset>
	</div>
</Sidebar.Provider>

<Toaster />
