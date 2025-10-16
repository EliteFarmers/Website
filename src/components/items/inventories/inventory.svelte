<script lang="ts">
	import type { HypixelInventoryDto, ItemDto } from '$lib/api';
	import * as Dialog from '$ui/dialog';
	import ItemLore from '../item-lore.svelte';

	interface Props {
		inventory: HypixelInventoryDto;
	}

	let { inventory }: Props = $props();

	let items = $derived.by(() => {
		return Object.entries(inventory.items).sort((a, b) => Number(a[0]) - Number(b[0]));
	});

	let selectedItem = $state<ItemDto | null>(null);
	let open = $state(false);
</script>

<div class="my-1 grid w-fit grid-cols-9 items-center justify-center gap-2">
	{#each items as [slot, item] (slot)}
		{#if item}
			<button class="relative" onclick={() => ((selectedItem = item), (open = true))}>
				<img
					src="/api/texture/{inventory.id}/{slot}"
					alt={item.name ?? 'Unknown Item'}
					title={item.name ?? 'Unknown Item'}
					class="bg-card h-12 w-12 rounded-md border p-1 shadow-md"
					loading="lazy"
				/>
				{#if item?.count && item.count > 1}
					<span
						class="bg-opacity-75 absolute right-0.5 bottom-0.5 rounded-md px-1 text-sm font-bold text-white text-shadow-lg"
						>{item.count}</span
					>
				{/if}
			</button>
		{:else}
			<div class="bg-card h-12 w-12 rounded-md border p-1 shadow-md"></div>
		{/if}

		<!-- <Lorebtn class="relative" {item}>
			{#if item?.count && item.count > 1}
				<span
					class="bg-opacity-75 text-shadow absolute right-0.5 bottom-0.5 rounded-md px-1 text-sm font-bold text-white"
					>{item.count}</span
				>
			{/if}
		</Lorebtn> -->
	{/each}
</div>

<Dialog.Root bind:open>
	<Dialog.ScrollContent class="dark bg-background border-border text-primary">
		{#if selectedItem}
			<ItemLore item={selectedItem} />
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>
