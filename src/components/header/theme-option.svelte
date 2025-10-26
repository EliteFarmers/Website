<script lang="ts">
	import { getThemeContext, type ThemeInfo } from '$lib/stores/themes.svelte';
	import Check from '@lucide/svelte/icons/check';

	const currentTheme = getThemeContext();

	interface Props {
		theme: ThemeInfo;
	}

	let { theme }: Props = $props();
</script>

<button
	onclick={() => (currentTheme.theme = theme.class)}
	class="flex cursor-pointer flex-row items-center {theme.class} bg-background border-border hover:bg-card flex flex-row items-center justify-between gap-2 rounded-md border px-4 py-2 md:w-full"
	style="color-scheme: {theme.class};"
>
	<span class="text-primary capitalize">{theme.name}</span>
	{#if currentTheme.theme === theme.class}
		<Check class="h-4 w-4" />
	{:else}
		<span class="h-4 w-4"></span>
	{/if}
</button>
