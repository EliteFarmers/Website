<script lang="ts">
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import type { Editor } from '@tiptap/core';

	interface EditNode {
		skyblockId: string;
		multiplier: number;
		pos: number;
	}

	interface Props {
		open: boolean;
		editor: Editor | undefined;
		onOpenChange: (open: boolean) => void;
		editNode?: EditNode | null;
	}

	let { open, editor, onOpenChange, editNode = null }: Props = $props();

	let skyblockId = $state('');
	let multiplier = $state(1);

	$effect(() => {
		if (editNode && open) {
			skyblockId = editNode.skyblockId || '';
			multiplier = editNode.multiplier || 1;
		}
	});

	function submit() {
		if (!editor || !skyblockId) return;

		if (editNode) {
			editor.commands.command(({ tr }) => {
				tr.setNodeMarkup(editNode.pos, undefined, {
					skyblockId: skyblockId.toUpperCase(),
					multiplier,
				});
				return true;
			});
		} else {
			editor
				.chain()
				.focus()
				.setItemPrice({
					skyblockId: skyblockId.toUpperCase(),
					multiplier,
				})
				.run();
		}

		onOpenChange(false);
		reset();
	}

	function reset() {
		skyblockId = '';
		multiplier = 1;
	}

	let isEditing = $derived(!!editNode);
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{isEditing ? 'Edit' : 'Insert'} Item Price</Dialog.Title>
			<Dialog.Description>Display the current price of a Skyblock item.</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="price-item-id" class="text-right">Item ID</Label>
				<Input
					id="price-item-id"
					bind:value={skyblockId}
					placeholder="e.g. HYPERION"
					class="col-span-3 uppercase"
				/>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="multiplier" class="text-right">Multiplier</Label>
				<Input
					id="multiplier"
					type="number"
					min="1"
					bind:value={multiplier}
					placeholder="1"
					class="col-span-3"
				/>
			</div>
			<p class="text-muted-foreground col-span-4 text-sm">
				Use multiplier for stack prices (e.g., 64 for a full stack).
			</p>
		</div>
		<Dialog.Footer>
			<Button type="submit" onclick={submit} disabled={!skyblockId}>
				{isEditing ? 'Update' : 'Insert'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
