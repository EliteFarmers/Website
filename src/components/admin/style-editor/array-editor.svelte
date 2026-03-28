<script lang="ts">
	import { Button } from '$ui/button';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash_2 from '@lucide/svelte/icons/trash-2';
	import type { Snippet } from 'svelte';
	import EditorSection from './editor-section.svelte';

	interface Props {
		title: string;
		items: unknown[];
		open?: boolean;
		onadd: () => void;
		onremove: (index: number) => void;
		children: Snippet<[number]>;
	}

	let { title, items, open = $bindable(true), onadd, onremove, children }: Props = $props();
</script>

<EditorSection title="{title} ({items.length})" bind:open>
	{#each items, i (i)}
		<div class="flex flex-row items-start gap-1">
			<div class="flex flex-1 flex-col gap-2 rounded border p-2">
				{@render children(i)}
			</div>
			<Button variant="ghost" size="sm" class="h-6 w-6 shrink-0 p-0" onclick={() => onremove(i)}>
				<Trash_2 size={12} class="text-destructive" />
			</Button>
		</div>
	{/each}
	<Button variant="outline" size="sm" class="h-7 w-fit gap-1 text-xs" onclick={onadd}>
		<Plus size={12} /> Add
	</Button>
</EditorSection>
