<script lang="ts">
	import { dispatchEditAccordion } from '$lib/editor/editor-events';
	import type { SvelteNodeViewComponentProps } from '$lib/editor/svelte-node-view-renderer';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Pencil from '@lucide/svelte/icons/pencil';

	let { node, selected, getPos }: SvelteNodeViewComponentProps = $props();

	let title = $derived((node.attrs.title as string) || 'Click to expand');

	function handleEditClick(e: MouseEvent) {
		e.stopPropagation();
		const pos = getPos();
		if (pos !== undefined) {
			dispatchEditAccordion({ title, pos });
		}
	}
</script>

<div class={`bg-card my-4 rounded-lg border shadow-sm ${selected ? 'ring-primary ring-2' : ''}`} data-type="accordion">
	<div class="bg-muted/50 flex items-center gap-2 rounded-t-lg border-b px-4 py-3">
		<ChevronDown class="text-muted-foreground size-4 shrink-0" />
		<span class="flex-1 text-sm font-medium">{title}</span>
		<button
			type="button"
			onclick={handleEditClick}
			class="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1"
			title="Edit title"
		>
			<Pencil class="size-3" />
		</button>
	</div>
	<div class="accordion-content p-4" data-node-view-content></div>
</div>
