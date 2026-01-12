<script lang="ts">
	import type { CalloutVariant } from '$lib/editor/extensions/callout';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import type { Editor } from '@tiptap/core';

	interface Props {
		open: boolean;
		editor: Editor | undefined;
		onOpenChange: (open: boolean) => void;
	}

	let { open, editor, onOpenChange }: Props = $props();

	const variants: { value: CalloutVariant; label: string; color: string }[] = [
		{ value: 'note', label: 'Note', color: 'bg-blue-500' },
		{ value: 'tip', label: 'Tip', color: 'bg-cyan-500' },
		{ value: 'warning', label: 'Warning', color: 'bg-orange-500' },
		{ value: 'danger', label: 'Danger', color: 'bg-red-500' },
		{ value: 'success', label: 'Success', color: 'bg-green-500' },
		{ value: 'question', label: 'Question', color: 'bg-orange-500' },
		{ value: 'example', label: 'Example', color: 'bg-purple-500' },
		{ value: 'quote', label: 'Quote', color: 'bg-zinc-500' },
	];

	let selectedVariant = $state<CalloutVariant>('note');

	function submit() {
		if (!editor) return;
		editor.chain().focus().setCallout({ variant: selectedVariant }).run();
		onOpenChange(false);
		selectedVariant = 'note';
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Insert Callout</Dialog.Title>
			<Dialog.Description>Choose a callout type for your content.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Type</Label>
				<div class="col-span-3">
					<Select.Root type="single" bind:value={selectedVariant}>
						<Select.Trigger class="w-full">
							{variants.find((v) => v.value === selectedVariant)?.label || 'Select type'}
						</Select.Trigger>
						<Select.Content>
							{#each variants as v, i (i)}
								<Select.Item value={v.value}>
									<span class="flex items-center gap-2">
										<span class="size-3 rounded-full {v.color}"></span>
										{v.label}
									</span>
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit" onclick={submit}>Insert</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
