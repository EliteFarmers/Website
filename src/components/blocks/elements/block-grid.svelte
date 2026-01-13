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

<div class="my-4 inline-block">
	<div class="grid gap-0.5" style="grid-template-columns: repeat({node.cols}, 1fr);">
		{#each { length: node.rows }, rowIdx (rowIdx)}
			{#each { length: node.cols }, colIdx (colIdx)}
				{@const cell = node.cells[rowIdx]?.[colIdx]}
				<div
					class="relative flex size-12 items-center justify-center overflow-hidden border"
					style={cell?.blockName
						? `background-image: url('/api/block/${cell.blockName}.webp${gbl.packsParam}'); background-size: cover;`
						: ''}
				>
					{#if cell?.overlayItem}
						<ItemRender skyblockId={cell.overlayItem} class="size-10" />
					{/if}
				</div>
			{/each}
		{/each}
	</div>
</div>
