<script lang="ts">
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import { onMount } from 'svelte';
	import { Theme, themeStore } from '$stores/themeStore';

	import Nav from '$comp/nav.svelte';
	import Footer from '$comp/footer.svelte';

	onMount(async () => {
		themeStore.subscribe((value) => {
			if (value !== Theme.Unset) window.localStorage.setItem('theme', value);
		});

		const stored = window.localStorage.getItem('theme') ?? Theme.Unset;

		if (stored === Theme.Unset) {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
			if (!prefersDark.matches) {
				themeStore.set(Theme.Light);
			} else {
				themeStore.set(Theme.Dark);
			}
		} else {
			themeStore.set(stored as Theme);
		}
	});
</script>

<svelte:head>
	<meta name="author" content="Kaeso" />
	<meta name="robots" content="index, follow" />
	<meta property="og:url" content={$page.url.toString()} />

	<!-- SMUI Styles -->
	{#if $themeStore === Theme.Dark}
		<link rel="stylesheet" href="/smui-dark.css" />
	{:else if $themeStore === Theme.Light}
		<link rel="stylesheet" href="/smui.css" />
	{:else}
		<link rel="stylesheet" href="/smui.css" media="(prefers-color-scheme: light)" />
		<link rel="stylesheet" href="/smui-dark.css" media="screen and (prefers-color-scheme: dark)" />
	{/if}
</svelte:head>

<div class="{$themeStore} relative min-h-screen pb-16">
	<Nav discordUser={$page.data.discordUser} />

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
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>
