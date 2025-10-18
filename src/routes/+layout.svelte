<script lang="ts">
	import GTag from '$comp/analytics/g-tag.svelte';
	import ThemeWatcher from '$comp/theme-watcher.svelte';
	import { initGlobalContext } from '$lib/hooks/global.svelte';
	import { IsHover } from '$lib/hooks/is-hover.svelte';
	import { initThemeContext } from '$lib/stores/themes.svelte';
	import { Toaster } from '$ui/sonner';
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
</script>

<svelte:head>
	<meta name="author" content="Kaeso" />
	<meta name="robots" content="index, follow" />

	<link rel="dns-prefetch" href="https://assets.elitebot.dev/" />
	<link rel="dns-prefetch" href="https://cdn.discordapp.com/" />
</svelte:head>

{@render children?.()}

<Toaster />
<ThemeWatcher />
<GTag />
