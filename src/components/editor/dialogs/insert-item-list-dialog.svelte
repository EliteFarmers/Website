<script lang="ts">
	import type { ItemListItem } from '$comp/blocks/blocks';
	import ItemRender from '$comp/items/item-render.svelte';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { Editor } from '@tiptap/core';

	interface EditNode {
		items: ItemListItem[];
		pos: number;
	}

	interface Props {
		open: boolean;
		editor: Editor | undefined;
		onOpenChange: (open: boolean) => void;
		editNode?: EditNode | null;
	}

	let { open, editor, onOpenChange, editNode = null }: Props = $props();

	let items = $state<ItemListItem[]>([]);

	$effect(() => {
		if (editNode && open) {
			items = [...(editNode.items || [])];
		}
	});

	function addItem() {
		items = [...items, { skyblockId: '', quantity: 1 }];
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	function updateItem(index: number, field: 'skyblockId' | 'quantity', value: string | number) {
		items[index] = { ...items[index], [field]: value };
	}

	function submit() {
		if (!editor || !editNode) return;

		const validItems = items.filter((item) => item.skyblockId.trim() !== '');

		editor.commands.command(({ tr }) => {
			tr.setNodeMarkup(editNode.pos, undefined, { items: validItems });
			return true;
		});

		onOpenChange(false);
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Edit Item List</Dialog.Title>
			<Dialog.Description>Add items with quantities. Prices will be calculated automatically.</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-4 py-4">
			{#each items as item, i (i)}
				<div class="flex items-center gap-2">
					{#if item.skyblockId}
						<ItemRender skyblockId={item.skyblockId} class="size-8" />
					{:else}
						<div class="bg-muted size-8 rounded border"></div>
					{/if}
					<Input
						value={item.skyblockId}
						oninput={(e) => updateItem(i, 'skyblockId', (e.target as HTMLInputElement).value.toUpperCase())}
						placeholder="Item ID (e.g., WHEAT)"
						class="flex-1 uppercase"
					/>
					<Input
						type="number"
						value={item.quantity}
						oninput={(e) => updateItem(i, 'quantity', parseInt((e.target as HTMLInputElement).value) || 1)}
						class="w-20"
						min="1"
					/>
					<Button variant="ghost" size="icon" onclick={() => removeItem(i)}>
						<Trash2 class="size-4" />
					</Button>
				</div>
			{/each}

			<Button variant="outline" onclick={addItem} class="w-full">
				<Plus class="mr-2 size-4" />
				Add Item
			</Button>
		</div>

		<Dialog.Footer>
			<Button type="submit" onclick={submit}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
