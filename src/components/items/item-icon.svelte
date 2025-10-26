<script lang="ts">
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { cn } from '$lib/utils';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	interface Props {
		url: string;
		class?: string;
	}

	let { url, class: customClass }: Props = $props();

	let errored = $state(false);
	let loading = $state(true);

	$effect(() => {
		if (url || gbl.packsParam) {
			loading = true;
			errored = false;
		}
	});

	const gbl = getGlobalContext();
</script>

<div class={cn('bg-card relative aspect-square size-9 rounded-md border shadow-md sm:size-12', customClass)}>
	{#if loading && !errored}
		<LoaderCircle class="m-1.5 size-5 animate-spin sm:m-3 sm:size-6" />
	{/if}

	<img
		loading="lazy"
		class="h-full w-full rounded-md p-1 {loading || errored ? 'opacity-0' : 'opacity-100'} pixelated aspect-square"
		src="{url}{gbl.packsParam}"
		alt="Item"
		onload={() => (loading = false)}
		onerror={() => {
			errored = true;
			loading = false;
		}}
	/>
</div>
