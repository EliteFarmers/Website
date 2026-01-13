<script lang="ts">
	import type { BlockGridCell } from '$comp/blocks/blocks';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import type { Editor } from '@tiptap/core';
	import { untrack } from 'svelte';
	import EditorItemRender from '../nodes/editor-item-render.svelte';

	interface EditNode {
		rows: number;
		cols: number;
		cells: BlockGridCell[][];
		pos: number;
	}

	interface Props {
		open: boolean;
		editor: Editor | undefined;
		onOpenChange: (open: boolean) => void;
		editNode?: EditNode | null;
	}

	let { open, editor, onOpenChange, editNode = null }: Props = $props();

	let rows = $state(3);
	let cols = $state(3);
	let cells = $state<BlockGridCell[][]>([]);
	let selectedRow = $state<number | null>(null);
	let selectedCol = $state<number | null>(null);

	$effect(() => {
		if (editNode && open) {
			untrack(() => {
				rows = editNode.rows || 3;
				cols = editNode.cols || 3;
				cells = editNode.cells?.map((row) => [...row]) || [];
				ensureCellsSize();
				selectedRow = null;
				selectedCol = null;
			});
		}
	});

	function ensureCellsSize() {
		while (cells.length < rows) {
			cells.push([]);
		}
		cells = cells.slice(0, rows).map((row) => {
			if (!row) return [];
			while (row.length < cols) {
				row.push({});
			}
			return row.slice(0, cols);
		});
	}

	function updateDimensions() {
		ensureCellsSize();
	}

	function updateCell(field: 'blockName' | 'overlayItem', value: string) {
		if (selectedRow !== null && selectedCol !== null) {
			cells[selectedRow][selectedCol] = {
				...cells[selectedRow][selectedCol],
				[field]: value || undefined,
			};
		}
	}

	function submit() {
		if (!editor || !editNode) return;

		editor.commands.command(({ tr }) => {
			tr.setNodeMarkup(editNode.pos, undefined, { rows, cols, cells });
			return true;
		});

		onOpenChange(false);
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
		<Dialog.Header>
			<Dialog.Title>Edit Block Grid</Dialog.Title>
			<Dialog.Description>
				Configure grid dimensions and block/item content. Click a cell to edit it.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-4 py-4">
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-2">
					<Label>Rows:</Label>
					<Input type="number" bind:value={rows} oninput={updateDimensions} class="w-20" min="1" max="20" />
				</div>
				<div class="flex items-center gap-2">
					<Label>Columns:</Label>
					<Input type="number" bind:value={cols} oninput={updateDimensions} class="w-20" min="1" max="20" />
				</div>
			</div>

			<div class="flex gap-4">
				<div class="grid gap-1" style="grid-template-columns: repeat({cols}, 1fr);">
					{#each { length: rows }, rowIdx (rowIdx)}
						{#each { length: cols }, colIdx (colIdx)}
							{@const cell = cells[rowIdx]?.[colIdx] || {}}
							<button
								type="button"
								onclick={() => {
									selectedRow = rowIdx;
									selectedCol = colIdx;
								}}
								class={`relative flex size-10 items-center justify-center overflow-hidden border ${selectedRow === rowIdx && selectedCol === colIdx ? 'ring-primary ring-2' : ''}`}
								style={cell.blockName
									? `background-image: url('/api/block/${cell.blockName}.webp'); background-size: cover;`
									: ''}
							>
								{#if cell.overlayItem}
									<EditorItemRender skyblockId={cell.overlayItem} class="size-8" />
								{/if}
							</button>
						{/each}
					{/each}
				</div>

				{#if selectedRow !== null && selectedCol !== null}
					<div class="bg-muted flex flex-col gap-3 rounded-lg border p-4">
						<h4 class="font-medium">Cell ({selectedRow + 1}, {selectedCol + 1})</h4>
						<div class="flex flex-col gap-2">
							<Label class="text-sm">Block Name</Label>
							<Input
								value={cells[selectedRow]?.[selectedCol]?.blockName || ''}
								onchange={(e) => updateCell('blockName', (e.target as HTMLInputElement).value)}
								placeholder="e.g., stone, dirt, grass_block"
								class="w-40"
							/>
						</div>
						<div class="flex flex-col gap-2">
							<Label class="text-sm">Overlay Item</Label>
							<Input
								value={cells[selectedRow]?.[selectedCol]?.overlayItem || ''}
								onchange={(e) =>
									updateCell('overlayItem', (e.target as HTMLInputElement).value.toUpperCase())}
								placeholder="e.g., WHEAT"
								class="w-40 uppercase"
							/>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button type="submit" onclick={submit}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
