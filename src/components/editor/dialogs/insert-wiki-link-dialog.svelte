<script lang="ts">
	import { normalizeWikiLinkUrl } from '$lib/guides/wiki-links';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import type { Editor } from '@tiptap/core';

	interface EditNode {
		url: string;
		pageName: string;
		pos: number;
	}

	interface Props {
		open: boolean;
		editor: Editor | undefined;
		onOpenChange: (open: boolean) => void;
		editNode?: EditNode | null;
	}

	let { open, editor, onOpenChange, editNode = null }: Props = $props();

	let wikiUrl = $state('');
	let errorMessage = $state('');

	$effect(() => {
		if (open) {
			wikiUrl = editNode?.url ?? '';
			errorMessage = '';
		}
	});

	function submit() {
		if (!editor || !wikiUrl) return;

		const normalized = normalizeWikiLinkUrl(wikiUrl);
		if (!normalized) {
			errorMessage = 'Enter a hypixelskyblock.minecraft.wiki/w/ page URL.';
			return;
		}

		if (editNode) {
			editor.commands.command(({ tr }) => {
				tr.setNodeMarkup(editNode.pos, undefined, normalized);
				return true;
			});
		} else {
			editor.chain().focus().setWikiLink(normalized).run();
		}

		onOpenChange(false);
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-[520px]">
		<Dialog.Header>
			<Dialog.Title>{editNode ? 'Edit Wiki Link' : 'Insert Wiki Link'}</Dialog.Title>
			<Dialog.Description>Paste a Hypixel SkyBlock Wiki page URL.</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="wiki-url" class="text-right">URL</Label>
				<Input
					id="wiki-url"
					bind:value={wikiUrl}
					placeholder="https://hypixelskyblock.minecraft.wiki/w/..."
					class="col-span-3"
					oninput={() => (errorMessage = '')}
				/>
			</div>
			{#if errorMessage}
				<p class="text-destructive col-span-4 text-sm">{errorMessage}</p>
			{/if}
			<p class="text-muted-foreground col-span-4 text-xs">
				Find articles on <a
					href="https://hypixelskyblock.minecraft.wiki/"
					target="_blank"
					class="text-link underline">the wiki</a
				>
				and paste the URL here to link to them.
				{#if editNode}
					<br />
					Leave the URL unchanged to keep the same link.
				{/if}
			</p>
		</div>

		<Dialog.Footer>
			<Button type="submit" onclick={submit} disabled={!wikiUrl}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
