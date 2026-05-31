<script lang="ts">
	import type { CreditsEntry } from '$comp/blocks/blocks';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { Editor } from '@tiptap/core';

	interface EditNode {
		entries: CreditsEntry[];
		pos: number;
	}

	interface Props {
		open: boolean;
		editor: Editor | undefined;
		onOpenChange: (open: boolean) => void;
		editNode?: EditNode | null;
	}

	let { open, editor, onOpenChange, editNode = null }: Props = $props();

	let entries = $state<CreditsEntry[]>([{ username: '', reason: '' }]);

	$effect(() => {
		if (open) {
			entries = editNode?.entries?.length
				? editNode.entries.map((entry) => ({ ...entry }))
				: [{ username: '', reason: '' }];
		}
	});

	function addEntry() {
		entries = [...entries, { username: '', reason: '' }];
	}

	function removeEntry(index: number) {
		entries = entries.filter((_, i) => i !== index);
	}

	function updateEntry(index: number, field: keyof CreditsEntry, value: string) {
		entries[index] = { ...entries[index], [field]: value };
	}

	function submit() {
		if (!editor) return;

		const validEntries = entries
			.map((entry) => ({
				username: entry.username.trim(),
				reason: entry.reason.trim(),
			}))
			.filter((entry) => entry.username || entry.reason);

		if (editNode) {
			editor.commands.command(({ tr }) => {
				tr.setNodeMarkup(editNode.pos, undefined, { entries: validEntries });
				return true;
			});
		} else {
			editor.chain().focus().setCredits({ entries: validEntries }).run();
		}

		onOpenChange(false);
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{editNode ? 'Edit Credits' : 'Insert Credits'}</Dialog.Title>
			<Dialog.Description>Add Minecraft usernames and a short reason for the credit.</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-3 py-4">
			<div
				class="text-muted-foreground grid grid-cols-[minmax(10rem,14rem)_1fr_2.5rem] gap-2 px-1 text-xs font-medium"
			>
				<span>Player</span>
				<span>Reason</span>
				<span></span>
			</div>
			{#each entries as entry, i (i)}
				<div class="grid grid-cols-[minmax(10rem,14rem)_1fr_2.5rem] items-center gap-2">
					<div class="flex items-center gap-2">
						<PlayerHead uuid={entry.username} class="size-7 rounded-sm" />
						<Input
							value={entry.username}
							oninput={(e) => updateEntry(i, 'username', (e.target as HTMLInputElement).value)}
							placeholder="Minecraft username"
						/>
					</div>
					<Input
						value={entry.reason}
						oninput={(e) => updateEntry(i, 'reason', (e.target as HTMLInputElement).value)}
						placeholder="Built the farm, verified rates, etc."
					/>
					<Button variant="ghost" size="icon" onclick={() => removeEntry(i)} aria-label="Remove credit">
						<Trash2 class="size-4" />
					</Button>
				</div>
			{/each}

			<Button variant="outline" onclick={addEntry} class="w-full">
				<Plus class="mr-2 size-4" />
				Add Credit
			</Button>
		</div>

		<Dialog.Footer>
			<Button type="submit" onclick={submit}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
