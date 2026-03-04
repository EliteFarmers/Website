<script lang="ts">
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import type { Editor } from '@tiptap/core';

	interface Props {
		open: boolean;
		editor: Editor | undefined;
		onOpenChange: (open: boolean) => void;
	}

	let { open, editor, onOpenChange }: Props = $props();

	let youtubeUrl = $state('');
	let errorMessage = $state('');

	function extractVideoId(url: string): string | null {
		// Handle various YouTube URL formats
		const patterns = [
			/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
			/^([a-zA-Z0-9_-]{11})$/, // Just the video ID
		];

		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) return match[1];
		}
		return null;
	}

	function submit() {
		if (!editor || !youtubeUrl) return;

		const videoId = extractVideoId(youtubeUrl.trim());
		if (!videoId) {
			errorMessage = 'Invalid YouTube URL or video ID';
			return;
		}

		editor.chain().focus().setYouTube({ videoId }).run();

		onOpenChange(false);
		reset();
	}

	function reset() {
		youtubeUrl = '';
		errorMessage = '';
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Insert YouTube Video</Dialog.Title>
			<Dialog.Description>Paste a YouTube URL or video ID.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="youtube-url" class="text-right">URL</Label>
				<Input
					id="youtube-url"
					bind:value={youtubeUrl}
					placeholder="https://youtube.com/watch?v=..."
					class="col-span-3"
					oninput={() => (errorMessage = '')}
				/>
			</div>
			{#if errorMessage}
				<p class="text-destructive col-span-4 text-sm">{errorMessage}</p>
			{/if}
			<p class="text-muted-foreground col-span-4 text-xs">
				Supports youtube.com/watch?v=..., youtu.be/..., or just the 11-character video ID.
			</p>
		</div>
		<Dialog.Footer>
			<Button type="submit" onclick={submit} disabled={!youtubeUrl}>Insert</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
