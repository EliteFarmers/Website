<script lang="ts">
	import Nav from '$comp/nav.svelte';
	import { page } from '$app/stores';
</script>

<Nav discordUser={$page.data.discordUser} />

<slot />

<style lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	:global(body) {
		margin: 0;
	}
</style>
