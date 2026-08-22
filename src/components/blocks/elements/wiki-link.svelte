<script lang="ts">
	import type { WikiLinkInlineNode } from '$comp/blocks/blocks';
	import { normalizeWikiLinkUrl } from '$lib/guides/wiki-links';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	interface Props {
		node: WikiLinkInlineNode;
	}

	let { node }: Props = $props();

	const normalized = $derived(normalizeWikiLinkUrl(node.url));
	const href = $derived(normalized?.url ?? '#');
	const pageName = $derived(node.pageName || normalized?.pageName || 'Hypixel SkyBlock Wiki');
</script>

<a
	{href}
	target="_blank"
	rel="noopener noreferrer"
	class="inline-flex items-center gap-1.5 rounded-md border bg-card px-1.5 py-0.5 align-baseline text-sm no-underline shadow-sm transition-colors hover:bg-accent/40"
>
	<img src="/wiki-favicon.ico" alt="" class="size-4 rounded-sm" />
	<span class="font-medium">{pageName}</span>
	<ExternalLink class="size-3.5 shrink-0 text-muted-foreground" />
</a>
