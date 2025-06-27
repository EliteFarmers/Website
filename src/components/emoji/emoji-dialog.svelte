<script lang="ts">
	import { Button, buttonVariants } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import EmojiPicker from './emoji-picker.svelte';
	import type { Snippet } from 'svelte';
	import Trash_2 from '@lucide/svelte/icons/trash-2';

	interface Props {
		ign?: string;
		selected?: string | null;
		name?: string;
		trigger?: Snippet;
		disabled?: boolean;
		onChange?: (emoji: string | null) => void;
	}

	let { selected = $bindable(null), name, ign, trigger, disabled, onChange }: Props = $props();
</script>

<Dialog.Root
	onOpenChange={(open) => {
		if (!open) {
			onChange?.(selected);
		}
	}}
>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', class: 'px-2' })} type="button" {disabled}>
		{#if trigger}
			{@render trigger()}
		{:else if selected}
			<span class="emoji text-lg">{selected}</span>
		{/if}
	</Dialog.Trigger>
	<Dialog.ScrollContent class="dark">
		<Dialog.Header class="flex flex-col items-center justify-center gap-2">
			{#if selected}
				<span class="emoji text-2xl">{ign} {selected}</span>
			{:else}
				<span class="emoji text-2xl">{ign}</span>
			{/if}
		</Dialog.Header>
		<div class="py-4 md:p-4">
			<EmojiPicker bind:selected {name} />
		</div>

		<Button type="button" class="max-w-fit p-0" variant="link" onclick={() => (selected = '')}>
			<Trash_2 />
			Reset Emoji
		</Button>
	</Dialog.ScrollContent>
</Dialog.Root>
