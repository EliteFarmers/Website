<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import CollectionBar from './collectionbar.svelte';

	const ctx = getStatsContext();
	const collections = $derived(ctx.collections);
	const ranks = $derived(ctx.ranks ?? {});

	let weightSort = $state(true);

	let list = $derived.by(() => {
		return (
			(weightSort
				? collections?.toSorted((a, b) => b.weight - a.weight)
				: collections?.toSorted((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0)) ?? []
		);
	});

	function swap() {
		weightSort = !weightSort;
	}
</script>

<div class="-mt-5 flex max-w-4xl flex-1 flex-col gap-2">
	<button
		class="-mt-4 w-20 whitespace-nowrap rounded-md bg-card py-1 text-sm hover:bg-muted"
		onclick={swap}>{weightSort ? 'Weight ↓' : 'A-Z ↓'}</button
	>
	<div class="flex w-full flex-col gap-2">
		{#each list as item}
			<CollectionBar {...item} rank={ranks.collections?.[item.key]} pestRank={ranks.pests?.[item.pest]} />
		{/each}
	</div>
</div>
