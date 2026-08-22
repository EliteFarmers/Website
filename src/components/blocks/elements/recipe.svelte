<script lang="ts">
	import type { RecipeBlockNode } from '$comp/blocks/blocks';
	import ItemRender from '$comp/items/item-render.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	interface Props {
		node: RecipeBlockNode;
	}

	let { node }: Props = $props();
</script>

<div class="my-4 inline-flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
	<div class="grid grid-cols-3 gap-1">
		{#each { length: 9 }, i (i)}
			{@const slot = node.grid[i]}
			<div class="relative flex size-12 items-center justify-center rounded border bg-muted">
				{#if slot?.skyblockId}
					<ItemRender skyblockId={slot.skyblockId} class="size-10" />
					{#if slot.count && slot.count > 1}
						<span class="absolute right-0.5 bottom-0.5 text-xs font-bold text-foreground shadow-sm"
							>{slot.count}</span
						>
					{/if}
				{/if}
			</div>
		{/each}
	</div>

	<ArrowRight class="size-6 text-muted-foreground" />

	<div class="relative flex size-14 items-center justify-center rounded border-2 bg-muted">
		{#if node.output?.skyblockId}
			<ItemRender skyblockId={node.output.skyblockId} class="size-12" />
			{#if node.output.count && node.output.count > 1}
				<span class="absolute right-0.5 bottom-0.5 text-sm font-bold text-foreground shadow-sm"
					>{node.output.count}</span
				>
			{/if}
		{/if}
	</div>
</div>
