<script lang="ts">
	import type { HypixelInventoryDto, ItemDto } from '$lib/api';
	import { TEXTURE_PACKS } from '$lib/constants/packs';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getInventoryItemDetails } from '$lib/remote';
	import * as Dialog from '$ui/dialog';
	import { Skeleton } from '$ui/skeleton';
	import ItemLore from '../item-lore.svelte';
	import PackIcon from '../pack-icon.svelte';
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
	}

	let {
		inventory,
		sorter = (a, b) => Number(a[0]) - Number(b[0]),
		itemModifier = undefined,
		wrap = false,
		inventorySize = 27,
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
			slotId: selectedItem ? String(selectedItem.slot) : '',
			packs: gbl.packs
				.filter((p) => p.on)
				.map((p) => p.id)
				.join(','),
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
					/>
				{:else}
					<InventorySlot {item} inventoryId={inventory.id} {onSelect} />
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
			/>
		{:else}
			<InventorySlot {item} inventoryId={inventory.id} {onSelect} />
		{/if}
	{/each}
{/if}

<Dialog.Root bind:open>
	<Dialog.ScrollContent class="dark bg-background border-border text-primary">
		{#if selectedItem}
			<ItemLore item={selectedItem}>
				<div class="text-primary bg-card mt-4 mb-4 rounded-md border p-2">
					<p class="mb-2 text-lg font-semibold">Estimated Value</p>
					{#if itemDetails?.ready && itemDetails?.current?.auctions && itemDetails?.current.auctions.length > 0}
						{@const lowest = Math.min(...(itemDetails?.current?.auctions.map((a) => a.lowest3Day) ?? [0]))}
						<span class="dark:text-completed">
							{Math.round(
								Math.max(itemDetails?.current?.item?.npc_sell_price ?? 0, lowest) *
									(selectedItem?.count ?? 1)
							).toLocaleString()}
						</span>
						<span class="text-muted-foreground">coins</span>
					{:else if itemDetails?.ready && itemDetails?.current?.bazaar}
						{@const averageBuyOrder = itemDetails?.current.bazaar.averageBuyOrder}
						<span class="dark:text-completed">
							{Math.round(
								Math.max(itemDetails?.current?.item?.npc_sell_price ?? 0, averageBuyOrder) *
									(selectedItem?.count ?? 1)
							).toLocaleString()}
						</span>
						<span class="text-muted-foreground">coins</span>
					{:else if itemDetails?.ready}
						<span class="text-muted-foreground">Not found!</span>
					{:else}
						<Skeleton class="h-6 w-1/2" />
					{/if}
				</div>
				{#if itemDetails?.ready && itemDetails.current.meta?.packId && TEXTURE_PACKS[itemDetails.current.meta.packId]}
					{@const pack = TEXTURE_PACKS[itemDetails.current.meta.packId]}
					<a
						class="text-muted-foreground hover:border-border mt-4 mb-4 flex w-fit flex-row items-center gap-2 rounded-md border border-t border-transparent p-2 text-sm"
						href={pack.url}
						target="_blank"
						rel="noopener"
					>
						<PackIcon packId={itemDetails.current.meta.packId} class="size-10" />
						<div class="flex flex-col items-start">
							<p class="text-xs">Texture provided by</p>
							<p class="text-primary underline">{pack.name} by {pack.author}</p>
						</div>
					</a>
				{/if}
			</ItemLore>
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>
