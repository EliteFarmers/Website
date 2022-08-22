<script lang="ts">
	import Nav from '$comp/nav.svelte';
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
</script>

<Nav discordUser={$page.data.discordUser} />

{#if $navigating}
	<!-- Gray out the screen -->
	<div class="absolute top-0 left-0 w-full h-full bg-gray-100 opacity-50"></div>
{/if}

<slot />

<style lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	:global(body) {
		margin: 0;
	}
</style>
