<script lang="ts">
	import Copy from 'lucide-svelte/icons/copy';
	import Check from 'lucide-svelte/icons/check';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { Button } from '$ui/button';

	export let text: string;
	export let size: 'default' | 'sm' | 'lg' | 'icon' | undefined = undefined;
	let copyPromise: Promise<void> | null = null;

	$: iconSize = 20;
	$: {
		if (size === 'sm') iconSize = 16;
		if (size === 'lg') iconSize = 24;
	}

	function copy() {
		copyPromise = navigator.clipboard
			.writeText(text)
			.then((x) => new Promise((resolve) => setTimeout(() => resolve(x), 100)));

		setTimeout(() => {
			copyPromise = null;
		}, 3000);
	}
</script>

<Button variant="link" on:click={copy} {size}>
	{#if copyPromise}
		{#await copyPromise}
			<LoaderCircle class="animate-spin" size={iconSize} />
		{:then}
			<Check size={iconSize} />
		{:catch}
			<Copy size={iconSize} />
		{/await}
	{:else}
		<Copy size={iconSize} />
	{/if}
</Button>
