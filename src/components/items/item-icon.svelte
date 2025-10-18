<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	interface Props {
		url: string;
	}

	let { url }: Props = $props();

	let errored = $state(false);
	let loading = $state(true);
</script>

<div class="bg-card relative size-9 rounded-md border shadow-md sm:size-12">
	{#if loading && !errored}
		<LoaderCircle class="m-1.5 size-5 animate-spin sm:m-3 sm:size-6" />
	{/if}

	<img
		loading="lazy"
		class="h-full w-full rounded-md p-1 {loading || errored ? 'opacity-0' : 'opacity-100'}"
		src={url}
		alt="Item"
		onload={() => (loading = false)}
		onerror={() => {
			errored = true;
			loading = false;
		}}
	/>
</div>
