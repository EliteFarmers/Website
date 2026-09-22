<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import {
		compareRarity,
		GARDEN_VISITORS,
		Rarity,
		type GardenVisitor,
		type GardenVisitorStats,
	} from 'farming-weight';
	import MissingVisitor from './missing-visitor.svelte';

	const ctx = getStatsContext();

	const garden = $derived(ctx.garden);
	let visitors = $derived((garden?.visitors ?? {}) as Record<string, GardenVisitorStats>);

	let missingVisitors = $derived(
		Object.entries(GARDEN_VISITORS).reduce<Partial<Record<Rarity, GardenVisitor[]>>>((acc, [visitor, data]) => {
			const current = visitors[visitor];
			if ((current && current.accepted > 0) || !data) {
				return acc; // Not missing
			}
			acc[data.rarity] ??= [];
			acc[data.rarity]?.push(data);
			return acc;
		}, {})
	);

	let grouped = $derived(Object.entries(missingVisitors).sort(([a], [b]) => compareRarity(b as Rarity, a as Rarity)));
	const maxVisitors = Object.keys(GARDEN_VISITORS).length;
</script>

{#if (garden?.uniqueVisitors ?? 0) < maxVisitors}
	<div class="flex w-full flex-col gap-2 rounded-md bg-background p-3 text-foreground">
		<h3 class="text-xl leading-none font-semibold">Missing Visitors</h3>
		<div class="flex flex-wrap gap-1">
			{#each grouped as [rarity, list] (rarity)}
				{#each list as visitor (visitor.name)}
					<MissingVisitor {visitor} />
				{/each}
			{/each}
		</div>
	</div>
{/if}
