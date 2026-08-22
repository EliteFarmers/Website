<script lang="ts">
	import type { RecipeSlot } from '$comp/blocks/blocks';
	import { dispatchEditRecipe } from '$lib/editor/editor-events';
	import type { SvelteNodeViewComponentProps } from '$lib/editor/svelte-node-view-renderer';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import EditorItemRender from './editor-item-render.svelte';

	let { node, selected, getPos }: SvelteNodeViewComponentProps = $props();

	let grid = $derived((node.attrs.grid as RecipeSlot[]) || Array(9).fill({}));
	let output = $derived((node.attrs.output as RecipeSlot) || {});

	function handleClick() {
		const pos = getPos();
		if (pos !== undefined) {
			dispatchEditRecipe({ grid, output, pos });
		}
	}
</script>

<button
	type="button"
	onclick={handleClick}
	class={`my-2 inline-flex cursor-pointer items-center gap-4 rounded-lg border bg-card p-4 shadow-sm ${selected ? 'ring-2 ring-primary' : ''}`}
>
	<div class="grid grid-cols-3 gap-1">
		{#each { length: 9 }, i (i)}
			{@const slot = grid[i]}
			<div class="relative flex size-10 items-center justify-center rounded border bg-muted">
				{#if slot?.skyblockId}
					<EditorItemRender skyblockId={slot.skyblockId} class="size-8" />
					{#if slot.count && slot.count > 1}
						<span class="absolute right-0.5 bottom-0.5 text-xs font-bold">{slot.count}</span>
					{/if}
				{/if}
			</div>
		{/each}
	</div>

	<ArrowRight class="size-5 text-muted-foreground" />

	<div class="relative flex size-12 items-center justify-center rounded border-2 bg-muted">
		{#if output?.skyblockId}
			<EditorItemRender skyblockId={output.skyblockId} class="size-10" />
			{#if output.count && output.count > 1}
				<span class="absolute right-0.5 bottom-0.5 text-sm font-bold">{output.count}</span>
			{/if}
		{/if}
	</div>
</button>
