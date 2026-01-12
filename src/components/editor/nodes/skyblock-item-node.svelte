<script lang="ts">
	import { dispatchEditSkyblockItem } from '$lib/editor/editor-events';
	import type { SvelteNodeViewComponentProps } from '$lib/editor/svelte-node-view-renderer';
	import EditorItemRender from './editor-item-render.svelte';

	let { node, selected, getPos }: SvelteNodeViewComponentProps = $props();

	let skyblockId = $derived(node.attrs.skyblockId as string);
	let size = $derived((node.attrs.size as 'sm' | 'md' | 'lg') || 'md');
	let inline = $derived((node.attrs.inline as boolean) ?? true);

	let sizeClass = $derived(size === 'sm' ? 'size-6' : size === 'md' ? 'size-9' : 'size-12');

	function handleClick() {
		const pos = getPos();
		if (pos !== undefined) {
			dispatchEditSkyblockItem({ skyblockId, size, inline, pos });
		}
	}
</script>

<button
	type="button"
	onclick={handleClick}
	class={`relative mx-1 inline-flex cursor-pointer border-none bg-transparent p-0 align-middle ${selected ? 'ring-primary rounded-md ring-2' : ''}`}
>
	<EditorItemRender {skyblockId} class={`bg-card rounded-md border shadow-sm ${sizeClass}`} />
</button>
