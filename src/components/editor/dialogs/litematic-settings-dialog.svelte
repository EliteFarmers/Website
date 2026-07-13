<script lang="ts">
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import type { Editor } from '@tiptap/core';

	interface EditLitematicNode {
		pos: number;
		attrs: Record<string, unknown>;
	}

	interface Props {
		open: boolean;
		editor: Editor | undefined;
		onOpenChange: (open: boolean) => void;
		editNode?: EditLitematicNode | null;
	}

	let { open, editor, onOpenChange, editNode = null }: Props = $props();

	let name = $state('');

	$effect(() => {
		if (!open || !editNode) return;
		name = typeof editNode.attrs.name === 'string' ? editNode.attrs.name : '';
	});

	function submit() {
		if (!editor || !editNode) return;

		editor.commands.command(({ tr }) => {
			tr.setNodeMarkup(editNode.pos, undefined, {
				...editNode.attrs,
				name: name.trim() || null,
			});
			return true;
		});

		onOpenChange(false);
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Litematic Settings</Dialog.Title>
			<Dialog.Description>Change how this schematic is labeled in the guide.</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="litematic-display-name" class="text-right">Name</Label>
				<Input id="litematic-display-name" class="col-span-3" bind:value={name} placeholder="Display name" />
			</div>
		</div>

		<Dialog.Footer>
			<Button type="submit" onclick={submit} disabled={!editNode}>Update Litematic</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
