<script lang="ts">
	import type { BlockGridCell } from '$comp/blocks/blocks';
	import { dispatchEditBlockGrid } from '$lib/editor/editor-events';
	import type { SvelteNodeViewComponentProps } from '$lib/editor/svelte-node-view-renderer';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import EditorItemRender from './editor-item-render.svelte';

	let { node, selected, getPos }: SvelteNodeViewComponentProps = $props();

	let rows = $derived((node.attrs.rows as number) || 3);
	let cols = $derived((node.attrs.cols as number) || 3);
	let cells = $derived((node.attrs.cells as BlockGridCell[][]) || []);

	function handleClick() {
		const pos = getPos();
		if (pos !== undefined) {
			dispatchEditBlockGrid({ rows, cols, cells, pos });
		}
	}
</script>

<button
	type="button"
	onclick={handleClick}
	class={`bg-card my-2 inline-flex cursor-pointer flex-col gap-2 rounded-lg border p-4 shadow-sm ${selected ? 'ring-primary ring-2' : ''}`}
>
	<div class="text-muted-foreground flex items-center gap-2 text-sm font-medium">
		<LayoutGrid class="size-4" />
		Block Grid ({rows}×{cols})
	</div>
	<div class="grid gap-0.5" style="grid-template-columns: repeat({Math.min(cols, 6)}, 1fr);">
		{#each { length: Math.min(rows, 3) }, rowIdx (rowIdx)}
			{#each { length: Math.min(cols, 6) }, colIdx (colIdx)}
				{@const cell = cells[rowIdx]?.[colIdx]}
				<div class="relative flex size-8 items-center justify-center overflow-hidden border">
					{#if cell?.blockName}
						<img
							src="/api/block/{cell.blockName}.webp"
							alt={cell?.blockName}
							class="pixelated absolute inset-0 h-full w-full object-cover"
						/>
					{/if}
					{#if cell?.overlayItem}
						<EditorItemRender skyblockId={cell.overlayItem} class="size-6" />
					{/if}
				</div>
			{/each}
		{/each}
		{#if rows > 3 || cols > 6}
			<div class="text-muted-foreground flex size-8 items-center justify-center text-xs">...</div>
		{/if}
	</div>
</button>
