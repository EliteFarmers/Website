<script lang="ts">
	import ItemDialog from '$comp/items/item-dialog.svelte';
	import Farmingtool from '$comp/items/tools/farmingtool.svelte';
	import type { ItemDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getInventoryItemDetails } from '$lib/remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Button } from '$ui/button';
	import { Skeleton } from '$ui/skeleton';
	import {
		calcWeightForCrop,
		Crop,
		FarmingTool as FT,
		getCropMilestoneLevels,
		type EliteItemDto,
	} from 'farming-weight';
	import { watch } from 'runed';

	const ctx = getStatsContext();
	const gbl = getGlobalContext();

	const garden = $derived(ctx.garden);
	let shown = $state(13 - (ctx.member.current?.events?.length ?? 0));
	let currentShown = $state(13 - (ctx.member.current?.events?.length ?? 0));

	let actualTools = $state<FT[]>([]);
	let toolsLoading = $derived(ctx.farmingInventory.loading);

	watch(
		() => ctx.tools,
		(tools) => {
			const options = {
				milestones: getCropMilestoneLevels((garden?.crops ?? {}) as Record<string, number>),
			};

			actualTools = FT.fromArray(tools as EliteItemDto[], options).sort((a, b) => {
				return (
					calcWeightForCrop(b.crop ?? Crop.Wheat, b.farmed) -
					calcWeightForCrop(a.crop ?? Crop.Wheat, a.farmed)
				);
			});
		}
	);

	let selectedTool = $state<FT | null>(null);
	let selectedItem = $state<ItemDto | null>(null);
	let open = $state(false);
	let itemDetails = $state<ReturnType<typeof getInventoryItemDetails> | null>(null);

	function onSelect(tool: FT) {
		const item = tool.item as ItemDto;
		selectedTool = tool;
		selectedItem = item;
		open = true;

		itemDetails =
			item.inventoryId && item.inventorySlot
				? getInventoryItemDetails({
						inventoryUuid: item.inventoryId,
						slotId: item.inventorySlot,
						skyblockId: item.skyblockId ?? '',
						packs: gbl.enabledPackIds.join(',') || undefined,
					})
				: null;
	}
</script>

{#if actualTools.length !== 0 || toolsLoading}
	<div class="flex flex-1 flex-col items-center gap-2">
		{#each actualTools.slice(0, currentShown) as tool (tool)}
			<Farmingtool {tool} {onSelect} />
		{/each}
		{#if toolsLoading}
			{#each { length: 13 }, i (i)}
				<div class="my-1 h-20 w-full">
					<div class="flex h-full flex-row items-center gap-2 p-1">
						<Skeleton class="aspect-square h-18 w-18 rounded-lg" />
						<div class="flex grow flex-row justify-between gap-1 pr-2">
							<div class="flex flex-1 flex-col items-start gap-2">
								<Skeleton class="h-6 w-1/2 rounded-md" />
								<Skeleton class="h-6 w-1/5 rounded-md" />
							</div>
							<div class="flex flex-row items-center gap-2 pb-0.5 md:pb-0">
								<Skeleton class="size-6 rounded-md" />
								<Skeleton class="h-6 w-16 rounded-md" />
							</div>
						</div>
					</div>
				</div>
			{/each}
		{/if}
		{#if currentShown < ctx.tools.length}
			<Button
				class="bg-background text-foreground"
				variant="outline"
				size="sm"
				onclick={() => (currentShown = ctx.tools.length)}>Show All</Button
			>
		{:else if ctx.tools.length > shown}
			<Button
				class="bg-background text-foreground"
				variant="outline"
				size="sm"
				onclick={() => (currentShown = shown)}>Show Less</Button
			>
		{/if}
	</div>
{/if}

<ItemDialog bind:open bind:selectedItem {itemDetails}>
	{#if selectedTool?.cultivating}
		<p>
			<span class="font-semibold select-none">Cultivating:</span>
			<span class="select-all">{selectedTool.cultivating.toLocaleString()}</span>
		</p>
	{/if}
	{#if selectedTool?.counter && selectedTool.counter !== selectedTool.cultivating}
		<p>
			<span class="font-semibold select-none">Counter:</span>
			<span class="select-all">{selectedTool.counter.toLocaleString()}</span>
		</p>
	{/if}
</ItemDialog>
