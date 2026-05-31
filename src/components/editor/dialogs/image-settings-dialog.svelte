<script lang="ts">
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$ui/select';
	import { Textarea } from '$ui/textarea';
	import type { Editor } from '@tiptap/core';

	type ImageDisplaySize = 'natural' | 'small' | 'medium' | 'large' | 'full';
	type ImageAlign = 'left' | 'center' | 'right';

	interface EditImageNode {
		pos: number;
		attrs: Record<string, unknown>;
	}

	interface Props {
		open: boolean;
		editor: Editor | undefined;
		onOpenChange: (open: boolean) => void;
		editNode?: EditImageNode | null;
	}

	let { open, editor, onOpenChange, editNode = null }: Props = $props();

	let displaySize = $state<ImageDisplaySize>('natural');
	let align = $state<ImageAlign>('center');
	let alt = $state('');
	let caption = $state('');

	const sizeLabels: Record<ImageDisplaySize, string> = {
		natural: 'Natural',
		small: 'Small',
		medium: 'Medium',
		large: 'Large',
		full: 'Full',
	};

	const alignLabels: Record<ImageAlign, string> = {
		left: 'Left',
		center: 'Center',
		right: 'Right',
	};

	$effect(() => {
		if (!open || !editNode) return;

		displaySize = readDisplaySize(editNode.attrs.displaySize);
		align = readAlign(editNode.attrs.align);
		alt = typeof editNode.attrs.alt === 'string' ? editNode.attrs.alt : '';
		caption = typeof editNode.attrs.title === 'string' ? editNode.attrs.title : '';
	});

	function readDisplaySize(value: unknown): ImageDisplaySize {
		return value === 'small' || value === 'medium' || value === 'large' || value === 'full' || value === 'natural'
			? value
			: 'natural';
	}

	function readAlign(value: unknown): ImageAlign {
		return value === 'left' || value === 'right' || value === 'center' ? value : 'center';
	}

	function submit() {
		if (!editor || !editNode) return;

		editor.commands.command(({ tr }) => {
			tr.setNodeMarkup(editNode.pos, undefined, {
				...editNode.attrs,
				displaySize,
				align,
				alt: alt.trim() || null,
				title: caption.trim() || null,
			});
			return true;
		});

		onOpenChange(false);
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-[460px]">
		<Dialog.Header>
			<Dialog.Title>Image Settings</Dialog.Title>
			<Dialog.Description>Adjust how this image appears in the guide.</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Width</Label>
				<div class="col-span-3">
					<Select type="single" bind:value={displaySize}>
						<SelectTrigger>{sizeLabels[displaySize]}</SelectTrigger>
						<SelectContent>
							<SelectItem value="natural">Natural</SelectItem>
							<SelectItem value="small">Small</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="large">Large</SelectItem>
							<SelectItem value="full">Full</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div class="grid grid-cols-4 items-center gap-4">
				<Label class="text-right">Align</Label>
				<div class="col-span-3">
					<Select type="single" bind:value={align}>
						<SelectTrigger>{alignLabels[align]}</SelectTrigger>
						<SelectContent>
							<SelectItem value="left">Left</SelectItem>
							<SelectItem value="center">Center</SelectItem>
							<SelectItem value="right">Right</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="image-alt" class="text-right">Alt Text</Label>
				<Input id="image-alt" class="col-span-3" bind:value={alt} placeholder="Describe the image" />
			</div>

			<div class="grid grid-cols-4 items-start gap-4">
				<Label for="image-caption" class="pt-2 text-right">Caption</Label>
				<Textarea
					id="image-caption"
					class="col-span-3"
					bind:value={caption}
					rows={3}
					placeholder="Optional caption"
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button type="submit" onclick={submit} disabled={!editNode}>Update Image</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
