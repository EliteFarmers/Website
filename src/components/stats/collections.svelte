<script lang="ts">
	import type { components } from '$lib/api/api';
	import CollectionBar from './collectionbar.svelte';

	interface Props {
		collections: {
			name: string | undefined;
			value: number;
			minionTierField: number;
			weight: number;
			pest: string;
			pestKills: number;
			key: string;
		}[];
		ranks: components['schemas']['LeaderboardPositionsDto'];
	}

	let { collections, ranks }: Props = $props();

	let list = $state(collections?.sort((a, b) => b.weight - a.weight) ?? []);
	let weightSort = $state(true);

	function swap() {
		weightSort = !weightSort;

		list = weightSort
			? collections?.sort((a, b) => b.weight - a.weight)
			: collections?.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0);
	}
</script>

<div class="-mt-5 flex max-w-4xl flex-1 flex-col gap-2">
	<button
		class="-mt-4 w-20 whitespace-nowrap rounded-md bg-primary-foreground py-1 text-sm hover:bg-muted"
		onclick={swap}>{weightSort ? 'Weight ↓' : 'A-Z ↓'}</button
	>
	<div class="flex w-full flex-col gap-2">
		{#each list as item (item.name)}
			<CollectionBar {...item} rank={ranks.collections?.[item.key]} pestRank={ranks.pests?.[item.pest]} />
		{/each}
	</div>
</div>
