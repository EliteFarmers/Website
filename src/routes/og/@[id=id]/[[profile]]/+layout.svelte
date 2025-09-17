<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		if (dev) return;
		goto(page.url.href.replace('/og/', '/'), { replaceState: true });
	});
</script>

{@render children?.()}

<div class="my-16 w-full text-center">
	<p>You should not be here! Go to <a href="/" class="text-link underline">the homepage</a>.</p>
</div>
