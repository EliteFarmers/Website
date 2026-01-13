<script lang="ts">
	import type { RecipeSlot } from '$comp/blocks/blocks';
	import ItemRender from '$comp/items/item-render.svelte';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { Editor } from '@tiptap/core';

	interface EditNode {
		grid: RecipeSlot[];
		output: RecipeSlot;
		pos: number;
	}

	interface Props {
		open: boolean;
		editor: Editor | undefined;
		onOpenChange: (open: boolean) => void;
		editNode?: EditNode | null;
	}

	let { open, editor, onOpenChange, editNode = null }: Props = $props();

	let grid = $state<RecipeSlot[]>(Array(9).fill({}));
	let output = $state<RecipeSlot>({});

	$effect(() => {
		if (editNode && open) {
			grid = [...(editNode.grid || Array(9).fill({}))];
			output = { ...(editNode.output || {}) };
		}
	});

	function updateSlot(index: number, field: 'skyblockId' | 'count', value: string | number) {
		grid[index] = { ...grid[index], [field]: value };
	}

	function submit() {
		if (!editor || !editNode) return;

		editor.commands.command(({ tr }) => {
			tr.setNodeMarkup(editNode.pos, undefined, { grid, output });
			return true;
		});

		onOpenChange(false);
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>Edit Recipe</Dialog.Title>
			<Dialog.Description>Configure the crafting grid and output item.</Dialog.Description>
		</Dialog.Header>

		<div class="flex items-center gap-4 py-4">
			<div class="flex flex-col gap-2">
				<Label>Crafting Grid (3×3)</Label>
				<div class="grid grid-cols-3 gap-2">
					{#each { length: 9 }, i (i)}
						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-1">
								{#if grid[i]?.skyblockId}
									<ItemRender skyblockId={grid[i].skyblockId ?? ''} class="size-6" />
								{/if}
							</div>
							<Input
								value={grid[i]?.skyblockId || ''}
								oninput={(e) =>
									updateSlot(i, 'skyblockId', (e.target as HTMLInputElement).value.toUpperCase())}
								placeholder="Item ID"
								class="h-8 text-xs uppercase"
							/>
							<Input
								type="number"
								value={grid[i]?.count || 1}
								oninput={(e) =>
									updateSlot(i, 'count', parseInt((e.target as HTMLInputElement).value) || 1)}
								placeholder="Count"
								class="h-8 text-xs"
								min="1"
							/>
						</div>
					{/each}
				</div>
			</div>

			<ArrowRight class="text-muted-foreground size-6 shrink-0" />

			<div class="flex flex-col gap-2">
				<Label>Output</Label>
				<div class="flex flex-col gap-1">
					{#if output?.skyblockId}
						<ItemRender skyblockId={output.skyblockId} class="size-8" />
					{/if}
					<Input
						value={output?.skyblockId || ''}
						oninput={(e) =>
							(output = { ...output, skyblockId: (e.target as HTMLInputElement).value.toUpperCase() })}
						placeholder="Item ID"
						class="h-8 w-24 uppercase"
					/>
					<Input
						type="number"
						value={output?.count || 1}
						oninput={(e) =>
							(output = { ...output, count: parseInt((e.target as HTMLInputElement).value) || 1 })}
						placeholder="Count"
						class="h-8 w-24"
						min="1"
					/>
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button type="submit" onclick={submit}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
