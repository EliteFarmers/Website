<script lang="ts">
	import type { HypixelInventoryDto, ItemDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getInventoryItemDetails } from '$lib/remote';
	import ItemDialog from '../item-dialog.svelte';
	import InventoryBasic from './inventory-basic.svelte';
	import InventorySlot from './inventory-slot.svelte';

	interface Props {
		inventory: HypixelInventoryDto;
		sorter?: (a: [string, ItemDto | null], b: [string, ItemDto | null]) => number;
		itemModifier?: (
			inventory: string,
			slot: number,
			item: ItemDto | null
		) => { inventory: string; item: ItemDto | null; highlight?: boolean };
		wrap?: boolean;
		inventorySize?: number;
		subSlot?: string;
	}

	let {
		inventory,
		sorter = (a, b) => Number(a[0]) - Number(b[0]),
		itemModifier = undefined,
		wrap = false,
		inventorySize = 27,
		subSlot = undefined,
	}: Props = $props();

	let items = $derived.by(() => {
		return Object.entries(inventory?.items ?? {}).sort(sorter);
	});

	let selectedItem = $state<ItemDto | null>(null);
	let open = $state(false);
	let itemDetails = $state<ReturnType<typeof getInventoryItemDetails> | null>(null);
	const gbl = getGlobalContext();

	function onSelect(item: ItemDto | null) {
		selectedItem = item;
		open = true;
		if (!open) return;

		itemDetails = getInventoryItemDetails({
			inventoryUuid: inventory.id,
			skyblockId: selectedItem?.skyblockId ?? '',
			slotId: selectedItem ? (subSlot ?? String(selectedItem.slot)) : '',
			sub: selectedItem ? (subSlot ? String(selectedItem.slot) : undefined) : undefined,
			packs: gbl.packs.filter((p) => p.on).sort((a, b) => a.order - b.order)[0]?.id,
		});
	}
</script>

{#if wrap}
	{#each { length: Math.ceil(items.length / inventorySize) }, rowIndex (rowIndex)}
		<div class="my-1 grid w-fit grid-cols-9 items-center justify-center gap-2">
			{#each items.slice(rowIndex * inventorySize, (rowIndex + 1) * inventorySize) as [slot, item] (slot)}
				{#if itemModifier}
					{@const modified = itemModifier(inventory.id, +slot, item)}
					<InventorySlot
						item={modified.item}
						inventoryId={modified.inventory}
						{onSelect}
						highlight={modified.highlight}
						{subSlot}
					/>
				{:else}
					<InventorySlot {item} inventoryId={inventory.id} {onSelect} {subSlot} />
				{/if}
			{/each}
		</div>
	{/each}
{:else}
	{#each items as [slot, item] (slot)}
		{#if itemModifier}
			{@const modified = itemModifier(inventory.id, +slot, item)}
			<InventorySlot
				item={modified.item}
				inventoryId={modified.inventory}
				{onSelect}
				highlight={modified.highlight}
				{subSlot}
			/>
		{:else}
			<InventorySlot {item} inventoryId={inventory.id} {onSelect} {subSlot} />
		{/if}
	{/each}
{/if}

<ItemDialog bind:open bind:selectedItem {itemDetails}>
	{#snippet subInventory()}
		{#if selectedItem?.attributes?.inventory_data}
			<InventoryBasic
				inventory={{
					items: selectedItem.attributes?.inventory_data,
					id: inventory.id,
					name: inventory.name,
				}}
				inventorySize={200}
				subSlot={selectedItem.slot ?? undefined}
			/>
		{/if}
	{/snippet}
</ItemDialog>
