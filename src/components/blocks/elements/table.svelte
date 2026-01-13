<script lang="ts">
	import type { TableBlockNode } from '$comp/blocks/blocks';
	import BlockRenderer from '../block-renderer.svelte';

	interface Props {
		node: TableBlockNode;
	}

	let { node }: Props = $props();
</script>

<div class="my-4 overflow-x-auto">
	<table class="w-full border-collapse rounded-lg border">
		<tbody>
			{#each { length: node.rows }, rowIdx (rowIdx)}
				<tr>
					{#each { length: node.cols }, colIdx (colIdx)}
						{@const cell = node.cells[rowIdx]?.[colIdx] ?? []}
						<td class="border p-2 text-sm">
							<BlockRenderer content={cell} />
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
