<script lang="ts">
	import { Button } from '$ui/button';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash_2 from '@lucide/svelte/icons/trash-2';
	import type { Snippet } from 'svelte';
	import EditorSection from './editor-section.svelte';

	interface Props {
		title: string;
		present: boolean;
		open?: boolean;
		onadd: () => void;
		onremove: () => void;
		children: Snippet;
	}

	let { title, present, open = $bindable(false), onadd, onremove, children }: Props = $props();
</script>

{#if present}
	<div class="flex flex-col">
		<div class="flex flex-row items-start gap-1">
			<div class="flex-1">
				<EditorSection {title} bind:open>
					{@render children()}
				</EditorSection>
			</div>
			<Button variant="ghost" size="sm" class="h-6 w-6 shrink-0 p-0" onclick={onremove}>
				<Trash_2 size={12} class="text-destructive" />
			</Button>
		</div>
	</div>
{:else}
	<Button variant="outline" size="sm" class="h-7 w-fit gap-1 text-xs" onclick={onadd}>
		<Plus size={12} /> Add {title}
	</Button>
{/if}
