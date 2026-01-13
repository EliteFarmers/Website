<script lang="ts">
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import type { Editor } from '@tiptap/core';

	interface EditNode {
		title: string;
		pos: number;
	}

	interface Props {
		open: boolean;
		editor: Editor | undefined;
		onOpenChange: (open: boolean) => void;
		editNode?: EditNode | null;
	}

	let { open, editor, onOpenChange, editNode = null }: Props = $props();

	let title = $state('');

	$effect(() => {
		if (editNode && open) {
			title = editNode.title || 'Click to expand';
		}
	});

	function submit() {
		if (!editor || !editNode) return;

		editor.commands.command(({ tr }) => {
			tr.setNodeMarkup(editNode.pos, undefined, { title });
			return true;
		});

		onOpenChange(false);
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-[400px]">
		<Dialog.Header>
			<Dialog.Title>Edit Accordion Title</Dialog.Title>
			<Dialog.Description>Set the title displayed on the accordion header.</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-4 py-4">
			<div class="flex flex-col gap-2">
				<Label>Title</Label>
				<Input bind:value={title} placeholder="Click to expand" />
			</div>
		</div>

		<Dialog.Footer>
			<Button type="submit" onclick={submit}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
