<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	interface Props {
		url: string;
	}

	let { url }: Props = $props();

	let errored = $state(false);
	let loading = $state(true);
</script>

<div class="bg-card relative h-12 w-12 rounded-md border shadow-md">
	{#if loading && !errored}
		<LoaderCircle class="m-3 size-6 animate-spin" />
	{/if}

	<img
		loading="lazy"
		class="h-full w-full rounded-md p-1 {loading || errored ? 'opacity-0' : ''}"
		src={url}
		alt="Item"
		onload={() => (loading = false)}
		onerror={() => {
			errored = true;
			loading = false;
		}}
	/>
</div>
