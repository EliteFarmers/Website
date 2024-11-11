<script lang="ts">
	import { compareRarity, groupGardenVisitors, type GardenVisitorStats } from 'farming-weight';
	import type { components } from '$lib/api/api';
	import Visitor from './visitor.svelte';

	interface Props {
		garden?: components['schemas']['GardenDto'] | undefined;
	}

	let { garden = undefined }: Props = $props();

	let visitors = $derived(groupGardenVisitors((garden?.visitors ?? {}) as Record<string, GardenVisitorStats>));
	let groups = $derived(Object.entries(visitors).sort(([a], [b]) => compareRarity(b, a)));
</script>

<div class="flex flex-wrap gap-1">
	{#each groups as [rarity, list] (rarity)}
		{#each list as visitor (visitor.name)}
			<Visitor {visitor} />
		{/each}
	{/each}
</div>
