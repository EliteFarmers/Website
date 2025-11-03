<script lang="ts">
	import GTag from '$comp/analytics/g-tag.svelte';
	import PageToast from '$comp/page-toast.svelte';
	import ThemeWatcher from '$comp/theme-watcher.svelte';
	import { initGlobalContext } from '$lib/hooks/global.svelte';
	import { IsHover } from '$lib/hooks/is-hover.svelte';
	import { initPageContext } from '$lib/hooks/page.svelte';
	import { initFavoritesContext } from '$lib/stores/favorites.svelte';
	import { initRatesData } from '$lib/stores/ratesData';
	import { getAnyCropSelected, initAnyCropSelected, initSelectedCrops } from '$lib/stores/selectedCrops';
	import { initThemeContext } from '$lib/stores/themes.svelte';
	import { setContext } from 'svelte';
	import '../app.css';
	import type { LayoutData } from './$types';

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
</script>

<svelte:head>
	<meta name="author" content="Kaeso" />
	<meta name="robots" content="index, follow" />

	<link rel="dns-prefetch" href="https://assets.elitebot.dev/" />
	<link rel="dns-prefetch" href="https://cdn.discordapp.com/" />
</svelte:head>

{@render children?.()}

<PageToast />
<ThemeWatcher />
<GTag />
