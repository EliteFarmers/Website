<script lang="ts">
	import { dispatchEditWikiLink } from '$lib/editor/editor-events';
	import type { SvelteNodeViewComponentProps } from '$lib/editor/svelte-node-view-renderer';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	let { node, selected, getPos }: SvelteNodeViewComponentProps = $props();

	let url = $derived((node.attrs.url as string) || '');
	let pageName = $derived((node.attrs.pageName as string) || 'Wiki link');

	function handleClick() {
		const pos = getPos();
		if (pos !== undefined) {
			dispatchEditWikiLink({ url, pageName, pos });
		}
	}
</script>

<button
	type="button"
	onclick={handleClick}
	class={`bg-card inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-1.5 py-0.5 align-baseline text-sm shadow-sm ${selected ? 'ring-primary ring-2' : ''}`}
>
	<img src="/wiki-favicon.ico" alt="" class="size-4 rounded-sm" />
	<span class="font-medium">{pageName}</span>
	<ExternalLink class="text-muted-foreground size-3.5 shrink-0" />
</button>
