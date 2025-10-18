<script lang="ts">
	import type { HypixelInventoryOverviewDto, ItemDto } from '$lib/api';
	import { TEXTURE_PACKS } from '$lib/constants/packs';
	import { getMemberInventory } from '$lib/remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Dialog from '$ui/dialog';
	import ItemIcon from '../item-icon.svelte';
	import ItemLore from '../item-lore.svelte';

	interface Props {
		inventory: HypixelInventoryOverviewDto;
	}

	let { inventory }: Props = $props();

	const ctx = getStatsContext();

	let data = $derived(
		getMemberInventory({
			playerUuid: ctx.uuid,
			profileUuid: ctx.selectedProfile?.profileId ?? '',
			inventory: inventory.id,
		})
	);

	let items = $derived.by(() => {
		return Object.entries(data.current?.items ?? {}).sort((a, b) => Number(a[0]) - Number(b[0]));
	});

	let selectedItem = $state<ItemDto | null>(null);
	let open = $state(false);

	// Urls looks like .../renders/{packId}/items/...
	const packIdRegex = /\/renders\/([^/]+)\/items\//;

	let selectedPack = $derived.by(() => {
		if (!selectedItem) return null;
		const url = selectedItem.imageUrl;
		if (!url) return null;
		const match = url.match(packIdRegex);
		const packId = match ? match[1] : null;

		const pack = packId && TEXTURE_PACKS[packId] ? TEXTURE_PACKS[packId] : null;
		return { ...pack, id: packId };
	});
</script>

<div class="my-1 grid w-fit grid-cols-9 items-center justify-center gap-2">
	{#each items as [slot, item] (slot)}
		{#if item}
			{@const texture = item.imageUrl ?? `/api/texture/${inventory.id}/${slot}`}
			<button class="relative" onclick={() => ((selectedItem = item), (open = true))}>
				<ItemIcon url={texture} />
				{#if item?.count && item.count > 1}
					<span
						class="bg-opacity-75 absolute right-0.5 bottom-0.5 rounded-md px-1 text-sm font-bold text-white text-shadow-lg"
						>{item.count}</span
					>
				{/if}
			</button>
		{:else}
			<div class="bg-card size-9 rounded-md border p-1 shadow-md sm:size-12"></div>
		{/if}
	{/each}
</div>

<Dialog.Root bind:open>
	<Dialog.ScrollContent class="dark bg-background border-border text-primary">
		{#if selectedItem}
			<ItemLore item={selectedItem} />
		{/if}
		{#if selectedPack?.name}
			<a
				class="text-muted-foreground hover:border-border mt-4 flex w-fit flex-row items-center gap-2 rounded-md border border-t border-transparent p-2 text-sm"
				href={selectedPack.url}
				target="_blank"
				rel="noopener"
			>
				<img
					src="/api/packicon/{selectedPack.id}.png"
					alt="{selectedPack.name} Icon"
					class="pixelated size-8"
				/>
				<div class="flex flex-col items-start">
					<p class="text-xs">Texture provided by</p>
					<p class="text-primary underline">{selectedPack.name} by {selectedPack.author}</p>
				</div>
			</a>
		{/if}
	</Dialog.ScrollContent>
</Dialog.Root>
