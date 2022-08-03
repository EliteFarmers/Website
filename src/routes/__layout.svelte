<script lang="ts">
	import Nav from '$comp/nav.svelte';
</script>

<Nav />

<slot />

<style lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	:global(body) {
		margin: 0;
	}
</style>
