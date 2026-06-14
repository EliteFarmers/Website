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

	const gbl = getGlobalContext();
</script>

<div
	class={cn(
		'bg-card relative grid aspect-square size-9 place-items-center rounded-md border shadow-md sm:size-12',
		customClass
	)}
>
	{#if loading && !errored}
		<LoaderCircle class="col-start-1 row-start-1 size-6 animate-spin sm:size-8" />
	{/if}

	<img
		loading="lazy"
		class="col-start-1 row-start-1 aspect-square h-full w-full rounded-md p-1 {loading || errored
			? 'opacity-0'
			: 'opacity-100'} pixelated"
		src="{url}{gbl.packsParam && url.includes('?') ? gbl.packsParam.replace('?', '&') : gbl.packsParam}"
		alt="Item"
		onload={() => (loading = false)}
		onerror={() => {
			errored = true;
			loading = false;
		}}
	/>
</div>
