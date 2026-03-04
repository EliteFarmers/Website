<script lang="ts">
	import type { BlockGridBlockNode } from '$comp/blocks/blocks';
	import ItemRender from '$comp/items/item-render.svelte';
	import { getGlobalContext } from '$lib/hooks/global.svelte';

	interface Props {
		node: BlockGridBlockNode;
	}

	let { node }: Props = $props();

	const gbl = getGlobalContext();
</script>

<div class="my-4 inline-block w-full">
	<div class="grid w-fit gap-[0.5px] md:gap-0.5" style="grid-template-columns: repeat({node.cols}, 1fr);">
		{#each { length: node.rows }, rowIdx (rowIdx)}
			{#each { length: node.cols }, colIdx (colIdx)}
				{@const cell = node.cells[rowIdx]?.[colIdx]}
				<div
					class="relative flex aspect-square w-full max-w-8 items-center justify-center overflow-hidden border sm:size-8 md:size-12 md:max-w-12"
				>
					{#if cell?.blockName}
						<img
							src="/api/block/{cell.blockName}.webp{gbl.packsParam}"
							alt={cell?.blockName}
							class="pixelated absolute inset-0 h-full w-full object-cover brightness-90"
						/>
					{/if}
					{#if cell?.overlayItem}
						<ItemRender
							skyblockId={cell.overlayItem}
							class="w-full brightness-110 drop-shadow-md sm:size-6 md:size-10"
						/>
					{/if}
				</div>
			{/each}
		{/each}
	</div>
</div>
