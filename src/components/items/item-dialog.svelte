<script lang="ts">
	import ItemLore from '$comp/items/item-lore.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import type { ItemDto } from '$lib/api';
	import { TEXTURE_PACKS } from '$lib/constants/packs';
	import { getInventoryItemDetails } from '$lib/remote';
	import * as Dialog from '$ui/dialog';
	import { Skeleton } from '$ui/skeleton';
	import type { Snippet } from 'svelte';
	import InventorySlot from './inventories/inventory-slot.svelte';
	import PackIcon from './pack-icon.svelte';

	interface Props {
		open: boolean;
		selectedItem: ItemDto | null;
		itemDetails?: ReturnType<typeof getInventoryItemDetails> | null;
		subInventory?: Snippet;
	}

	let {
		open = $bindable(false),
		selectedItem = $bindable(null),
		itemDetails = null,
		subInventory = undefined,
	}: Props = $props();

	const deletorCompactorItems = $derived(
		Object.entries(selectedItem?.attributes ?? {})
			.filter(([k]) => k.startsWith('personal_deletor_') || k.startsWith('personal_compact_'))
			.map(([k, v]) => [+(k.split('_').at(-1) ?? 0), v] as [number, string])
			.sort((a, b) => a[0] - b[0])
	);
</script>

<Dialog.Root bind:open>
	<Dialog.ScrollContent class="dark bg-background border-border text-primary">
		{#if selectedItem}
			<ItemLore
				item={selectedItem}
				networth={itemDetails?.ready ? itemDetails.current.meta?.networth : undefined}
			>
				{#if selectedItem.attributes?.inventory_data}
					<div class="my-4 grid w-fit grid-cols-9 items-center justify-center gap-1">
						{#if subInventory}
							{@render subInventory?.()}
						{:else}
							{#each Object.entries(selectedItem.attributes?.inventory_data ?? {}) as [slot, item] (slot)}
								<InventorySlot
									{item}
									onSelect={() => {
										selectedItem = item;
										open = true;
									}}
								/>
							{/each}
						{/if}
					</div>
				{:else if deletorCompactorItems.length > 0}
					<div class="my-4 grid w-fit grid-cols-9 items-center justify-center gap-1">
						{#each deletorCompactorItems as [key, itemId] (key)}
							<ItemRender skyblockId={itemId} class="bg-card size-12 rounded-sm border" />
						{/each}
					</div>
				{/if}
				{#if itemDetails !== null}
					<div class="text-primary bg-card mt-4 mb-4 flex flex-col gap-2 rounded-md border p-2">
						<p class="text-lg font-semibold">Item Value</p>
						{#if itemDetails?.ready && itemDetails.current.meta?.networth}
							{@const networthValue = itemDetails.current.meta.networth.price ?? 0}
							<span>
								<span class="dark:text-completed">
									{Math.round(networthValue * (selectedItem?.count ?? 1)).toLocaleString()}
								</span>
								<span class="text-muted-foreground">coins (networth)</span>
							</span>
						{/if}
						{#if itemDetails?.ready && itemDetails?.current?.auctions && itemDetails?.current.auctions.length > 0}
							{@const lowest = Math.min(
								...(itemDetails?.current?.auctions.map((a) => a.lowest3Day) ?? [0])
							)}
							<span>
								<span class="dark:text-completed">
									{Math.round(
										Math.max(itemDetails?.current?.item?.npc_sell_price ?? 0, lowest) *
											(selectedItem?.count ?? 1)
									).toLocaleString()}
								</span>
								<span class="text-muted-foreground">coins (lowest bin)</span>
							</span>
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
				{/if}
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
