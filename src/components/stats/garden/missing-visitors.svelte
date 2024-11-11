<script lang="ts">
	import {
		compareRarity,
		GARDEN_VISITORS,
		Rarity,
		type GardenVisitor,
		type GardenVisitorStats,
	} from 'farming-weight';
	import type { components } from '$lib/api/api';
	import MissingVisitor from './missing-visitor.svelte';

	interface Props {
		garden?: components['schemas']['GardenDto'] | undefined;
	}

	let { garden = undefined }: Props = $props();

	let visitors = $derived((garden?.visitors ?? {}) as Record<string, GardenVisitorStats>);

	let missingVisitors = $derived(Object.entries(GARDEN_VISITORS).reduce<Partial<Record<Rarity, GardenVisitor[]>>>(
		(acc, [visitor, data]) => {
			const current = visitors[visitor];
			if ((current && current.accepted > 0) || !data) {
				return acc; // Not missing
			}
			acc[data.rarity] ??= [];
			acc[data.rarity]?.push(data);
			return acc;
		},
		{}
	));

	let grouped = $derived(Object.entries(missingVisitors).sort(([a], [b]) => compareRarity(b as Rarity, a as Rarity)));
</script>

<div class="flex flex-wrap gap-1">
	{#each grouped as [rarity, list] (rarity)}
		{#each list as visitor (visitor.name)}
			<MissingVisitor {visitor} />
		{/each}
	{/each}
</div>
