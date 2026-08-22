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

<div class={`my-4 rounded-lg border bg-card shadow-sm ${selected ? 'ring-2 ring-primary' : ''}`} data-type="accordion">
	<div class="flex items-center gap-2 rounded-t-lg border-b bg-muted/50 px-4 py-3">
		<ChevronDown class="size-4 shrink-0 text-muted-foreground" />
		<span class="flex-1 text-sm font-medium">{title}</span>
		<button
			type="button"
			onclick={handleEditClick}
			class="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
			title="Edit title"
		>
			<Pencil class="size-3" />
		</button>
	</div>
	<div class="accordion-content p-4" data-node-view-content></div>
</div>
