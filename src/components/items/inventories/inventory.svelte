<script lang="ts">
	import type { HypixelInventoryOverviewDto } from '$lib/api';
	import { getMemberInventories } from '$lib/remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import InventoryBasic from './inventory-basic.svelte';

	interface Props {
		inventory: HypixelInventoryOverviewDto;
		inventorySize?: number;
	}

	let { inventory, inventorySize }: Props = $props();

	const ctx = getStatsContext();

	let data = $derived(
		getMemberInventories({
			playerUuid: ctx.uuid,
			profileUuid: ctx.selectedProfile?.profileId ?? '',
			inventories: [inventory.id],
		})
	);
</script>

{#if data.current?.[inventory.name]}
	<InventoryBasic inventory={data.current?.[inventory.name]} wrap={true} {inventorySize} />
{/if}
