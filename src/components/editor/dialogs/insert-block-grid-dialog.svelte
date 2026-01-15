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

	// Region selection state
	let selectionStart = $state<{ row: number; col: number } | null>(null);
	let selectionEnd = $state<{ row: number; col: number } | null>(null);
	let isDragging = $state(false);

	// Computed selection bounds (normalized so start <= end)
	let selectionBounds = $derived.by(() => {
		if (!selectionStart || !selectionEnd) return null;
		return {
			minRow: Math.min(selectionStart.row, selectionEnd.row),
			maxRow: Math.max(selectionStart.row, selectionEnd.row),
			minCol: Math.min(selectionStart.col, selectionEnd.col),
			maxCol: Math.max(selectionStart.col, selectionEnd.col),
		};
	});

	function isCellSelected(rowIdx: number, colIdx: number): boolean {
		if (!selectionBounds) return false;
		return (
			rowIdx >= selectionBounds.minRow &&
			rowIdx <= selectionBounds.maxRow &&
			colIdx >= selectionBounds.minCol &&
			colIdx <= selectionBounds.maxCol
		);
	}

	function getSelectedCellCount(): number {
		if (!selectionBounds) return 0;
		return (
			(selectionBounds.maxRow - selectionBounds.minRow + 1) *
			(selectionBounds.maxCol - selectionBounds.minCol + 1)
		);
	}

	// Get common value across all selected cells, or empty if they differ
	function getCommonValue(field: 'blockName' | 'overlayItem'): string {
		if (!selectionBounds) return '';
		let commonValue: string | undefined = undefined;
		for (let r = selectionBounds.minRow; r <= selectionBounds.maxRow; r++) {
			for (let c = selectionBounds.minCol; c <= selectionBounds.maxCol; c++) {
				const cellValue = cells[r]?.[c]?.[field] || '';
				if (commonValue === undefined) {
					commonValue = cellValue;
				} else if (commonValue !== cellValue) {
					return ''; // Values differ
				}
			}
		}
		return commonValue ?? '';
	}

	$effect(() => {
		if (editNode && open) {
			untrack(() => {
				rows = editNode.rows || 3;
				cols = editNode.cols || 3;
				cells = editNode.cells?.map((row) => [...row]) || [];
				ensureCellsSize();
				selectionStart = null;
				selectionEnd = null;
				isDragging = false;
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

	function handleMouseDown(rowIdx: number, colIdx: number) {
		selectionStart = { row: rowIdx, col: colIdx };
		selectionEnd = { row: rowIdx, col: colIdx };
		isDragging = true;
	}

	function handleMouseEnter(rowIdx: number, colIdx: number) {
		if (isDragging) {
			selectionEnd = { row: rowIdx, col: colIdx };
		}
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function updateSelectedCells(field: 'blockName' | 'overlayItem', value: string) {
		if (!selectionBounds) return;
		for (let r = selectionBounds.minRow; r <= selectionBounds.maxRow; r++) {
			for (let c = selectionBounds.minCol; c <= selectionBounds.maxCol; c++) {
				cells[r][c] = {
					...cells[r][c],
					[field]: value || undefined,
				};
			}
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

<svelte:window onmouseup={handleMouseUp} />

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
		<Dialog.Header>
			<Dialog.Title>Edit Block Grid</Dialog.Title>
			<Dialog.Description>
				Configure grid dimensions and block/item content. Click or drag to select cells.
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
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="grid gap-1 select-none"
					style="grid-template-columns: repeat({cols}, 1fr);"
					onmouseup={handleMouseUp}
				>
					{#each { length: rows }, rowIdx (rowIdx)}
						{#each { length: cols }, colIdx (colIdx)}
							{@const cell = cells[rowIdx]?.[colIdx] || {}}
							{@const isSelected = isCellSelected(rowIdx, colIdx)}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								role="gridcell"
								tabindex="0"
								onmousedown={() => handleMouseDown(rowIdx, colIdx)}
								onmouseenter={() => handleMouseEnter(rowIdx, colIdx)}
								class={`relative flex size-10 cursor-pointer items-center justify-center overflow-hidden border ${isSelected ? 'ring-primary ring-2' : ''}`}
							>
								{#if cell.blockName}
									<img
										src="/api/block/{cell.blockName}.webp"
										alt={cell?.blockName}
										class="pixelated pointer-events-none absolute inset-0 h-full w-full object-cover"
									/>
								{/if}
								{#if cell.overlayItem}
									<EditorItemRender
										skyblockId={cell.overlayItem}
										class="pointer-events-none size-8"
									/>
								{/if}
							</div>
						{/each}
					{/each}
				</div>

				{#if selectionBounds}
					<div class="bg-muted flex min-w-48 flex-col gap-3 rounded-lg border p-4">
						<h4 class="font-medium">
							{#if getSelectedCellCount() === 1}
								Cell ({selectionBounds.minRow + 1}, {selectionBounds.minCol + 1})
							{:else}
								{getSelectedCellCount()} cells selected
							{/if}
						</h4>
						<div class="flex flex-col gap-2">
							<Label class="text-sm">Block Name</Label>
							<Input
								value={getCommonValue('blockName')}
								onchange={(e) => updateSelectedCells('blockName', (e.target as HTMLInputElement).value)}
								placeholder={getSelectedCellCount() > 1 ? 'Set for all...' : 'e.g., stone, dirt'}
								class="w-40"
							/>
						</div>
						<div class="flex flex-col gap-2">
							<Label class="text-sm">Overlay Item</Label>
							<Input
								value={getCommonValue('overlayItem')}
								onchange={(e) =>
									updateSelectedCells(
										'overlayItem',
										(e.target as HTMLInputElement).value.toUpperCase()
									)}
								placeholder={getSelectedCellCount() > 1 ? 'Set for all...' : 'e.g., WHEAT'}
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
