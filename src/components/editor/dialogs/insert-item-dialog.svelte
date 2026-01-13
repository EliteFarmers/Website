<script lang="ts">
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$ui/select';
	import { Switch } from '$ui/switch';
	import type { Editor } from '@tiptap/core';

	interface EditNode {
		skyblockId: string;
		size: 'sm' | 'md' | 'lg';
		inline: boolean;
		pet: boolean;
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
	let size = $state<'sm' | 'md' | 'lg'>('md');
	let inline = $state(true);
	let pet = $state(false);

	// When editNode changes, populate the form
	$effect(() => {
		if (editNode && open) {
			skyblockId = editNode.skyblockId || '';
			size = editNode.size || 'md';
			inline = editNode.inline ?? true;
			pet = editNode.pet ?? false;
		}
	});

	function submit() {
		if (!editor || !skyblockId) return;

		if (editNode) {
			// Update existing node
			editor.commands.command(({ tr }) => {
				tr.setNodeMarkup(editNode.pos, undefined, {
					skyblockId: skyblockId.toUpperCase(),
					size,
					inline,
					pet,
				});
				return true;
			});
		} else {
			// Insert new node
			editor
				.chain()
				.focus()
				.setSkyblockItem({
					skyblockId: skyblockId.toUpperCase(),
					size,
					inline,
					pet,
				})
				.run();
		}

		onOpenChange(false);
		reset();
	}

	function reset() {
		skyblockId = '';
		size = 'md';
		inline = true;
		pet = false;
	}

	let isEditing = $derived(!!editNode);
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{isEditing ? 'Edit' : 'Insert'} Skyblock Item</Dialog.Title>
			<Dialog.Description>Enter the Skyblock Item ID to display its icon.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="skyblock-id" class="text-right">Item ID</Label>
				<Input
					id="skyblock-id"
					bind:value={skyblockId}
					placeholder="e.g. HYPERION"
					class="col-span-3 uppercase"
				/>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="size" class="text-right">Size</Label>
				<div class="col-span-3">
					<Select type="single" bind:value={size}>
						<SelectTrigger>
							{size === 'sm'
								? 'Small'
								: size === 'md'
									? 'Medium'
									: size === 'lg'
										? 'Large'
										: 'Select size'}
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="sm">Small</SelectItem>
							<SelectItem value="md">Medium</SelectItem>
							<SelectItem value="lg">Large</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="inline" class="text-right">Inline</Label>
				<div class="col-span-3 flex items-center space-x-2">
					<Switch id="inline" bind:checked={inline} />
					<Label for="inline">Display inline with text</Label>
				</div>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="pet" class="text-right">Pet</Label>
				<div class="col-span-3 flex items-center space-x-2">
					<Switch id="pet" bind:checked={pet} />
					<Label for="pet">Render as pet item</Label>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit" onclick={submit} disabled={!skyblockId}>
				{isEditing ? 'Update' : 'Insert'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
