<script lang="ts">
	import type { components } from '$lib/api/api';
	import CollectionBar from './collectionbar.svelte';

	export let collections: {
		name: string | undefined;
		value: number;
		minionTierField: number;
		weight: number;
		tier: number;
		maxTier: number;
		key: string;
	}[];
	export let ranks: components['schemas']['LeaderboardPositionsDto']['collections'];

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
		class="ml-2 -mt-4 py-1 rounded-md w-20 bg-gray-100 dark:bg-zinc-800 whitespace-nowrap text-sm hover:font-semibold"
		on:click={swap}>{weightSort ? 'Weight ↓' : 'A-Z ↓'}</button
	>
	<div class="flex flex-col gap-2 w-full">
		{#each list as item (item.name)}
			<CollectionBar {...item} rank={ranks?.[item.key]} />
		{/each}
	</div>
</div>
