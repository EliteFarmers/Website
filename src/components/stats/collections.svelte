<script lang="ts">
	import type { components } from '$lib/api/api';
	import CollectionBar from './collectionbar.svelte';

	export let collections: {
		name: string | undefined;
		value: number;
		minionTierField: number;
		weight: number;
		pest: string;
		pestKills: number;
		key: string;
	}[];
	export let ranks: components['schemas']['LeaderboardPositionsDto'];

	$: list = collections?.sort((a, b) => b.weight - a.weight) ?? [];
	$: weightSort = true;

	function swap() {
		weightSort = !weightSort;

		list = weightSort
			? collections?.sort((a, b) => b.weight - a.weight)
			: collections?.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0);
	}
</script>

<div class="flex-1 flex flex-col gap-2 -mt-5 max-w-4xl">
	<button
		class="-mt-4 py-1 rounded-md w-20 bg-primary-foreground whitespace-nowrap text-sm hover:bg-muted"
		on:click={swap}>{weightSort ? 'Weight ↓' : 'A-Z ↓'}</button
	>
	<div class="flex flex-col gap-2 w-full">
		{#each list as item (item.name)}
			<CollectionBar {...item} rank={ranks.collections?.[item.key]} pestRank={ranks.pests?.[item.pest]} />
		{/each}
	</div>
</div>
