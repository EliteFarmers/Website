<script lang="ts">
	import Nav from '$comp/nav.svelte';
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	enum Theme {
		Light = 'light',
		Dark = 'dark',
		Unset = 'unset',
	};

	let theme: Theme = Theme.Unset;
	if (browser) {
		const stored = localStorage.getItem('theme') ?? Theme.Unset;
		theme = stored as Theme;
	}

	onMount(async () => {
		const stored = localStorage.getItem('theme') ?? Theme.Unset;
		
		if (stored === Theme.Unset) {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
			if (prefersDark.matches) {
				theme = Theme.Dark;
			} else {
				theme = Theme.Light;
			}
		}
	});
</script>

<div class="{theme}">
	<Nav discordUser={$page.data.discordUser} />

	{#if $navigating}
		<!-- Gray out the screen -->
		<div class="absolute top-0 left-0 w-full h-full bg-gray-100 opacity-50" />
	{/if}

	<div class="dark:bg-zinc-900">
		<slot />
	</div>
</div>

<style lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	:global(body) {
		background-color: rgb(24 24 27 / 1);
		margin: 0;
	}

	.dark {
		@apply bg-zinc-900 text-white;
	}

	.light {
		@apply bg-white;
	}
</style>
