<script lang="ts">
	import { dispatchEditItemPrice } from '$lib/editor/editor-events';
	import type { SvelteNodeViewComponentProps } from '$lib/editor/svelte-node-view-renderer';
	import Coins from '@lucide/svelte/icons/coins';

	let { node, selected, getPos }: SvelteNodeViewComponentProps = $props();

	let skyblockId = $derived(node.attrs.skyblockId as string);
	let multiplier = $derived((node.attrs.multiplier as number) || 1);

	function handleClick() {
		const pos = getPos();
		if (pos !== undefined) {
			dispatchEditItemPrice({ skyblockId, multiplier, pos });
		}
	}

	let displayText = $derived(multiplier > 1 ? `${multiplier}x ${skyblockId} price` : `${skyblockId} price`);
</script>

<button
	type="button"
	onclick={handleClick}
	class={`inline-flex cursor-pointer items-center gap-1 rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200 ${selected ? 'ring-primary ring-2' : ''}`}
>
	<Coins class="size-3.5" />
	<span class="font-mono">{displayText}</span>
</button>
