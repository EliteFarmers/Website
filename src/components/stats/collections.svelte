<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Skeleton } from '$ui/skeleton';
	import CollectionBar from './collectionbar.svelte';

	const ctx = getStatsContext();
	const collections = $derived(ctx.collections);
	const ranks = $derived(ctx.ranks);

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
	<button class="bg-card hover:bg-muted -mt-4 w-20 rounded-md py-1 text-sm whitespace-nowrap" onclick={swap}
		>{weightSort ? 'Weight ↓' : 'A-Z ↓'}</button
	>
	<div class="flex w-full flex-col gap-2">
		{#each list as item (item.key)}
			<CollectionBar {...item} rank={ranks?.[item.key]?.rank} pestRank={ranks?.[item.pest]?.rank} />
		{/each}
		{#if ctx.member.loading}
			{#each { length: 10 }, i (i)}
				<div class="flex flex-row items-center gap-2 align-middle">
					<div class="h-20 w-full flex-1">
						<div class="flex h-full flex-row items-center gap-2 p-2">
							<Skeleton class="aspect-square h-18 w-18 rounded-lg" />
							<div class="flex grow flex-col justify-center gap-1 pr-2">
								<div class="flex flex-row items-center justify-between gap-2">
									<div class="flex flex-row items-center gap-1">
										<Skeleton class="h-6 w-20 rounded-md" />
									</div>
									<Skeleton class="h-6 w-14 rounded-md" />
								</div>
								<div class="flex flex-row items-center justify-between gap-2 pb-0.5 md:pb-0">
									<Skeleton class="h-6 w-10 rounded-md" />
									<div class="flex flex-row items-center gap-2">
										<Skeleton class="h-6 w-16 rounded-md" />
									</div>
								</div>
							</div>
						</div>
					</div>
					<Skeleton class="aspect-square h-20 p-1" />
				</div>
			{/each}
		{/if}
	</div>
</div>
