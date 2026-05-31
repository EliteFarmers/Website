<script lang="ts">
	import type { WikiLinkInlineNode } from '$comp/blocks/blocks';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	interface Props {
		node: WikiLinkInlineNode;
	}

	let { node }: Props = $props();
</script>

<a
	href={node.url}
	target="_blank"
	rel="noopener noreferrer"
	class="bg-card hover:bg-accent/40 inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 align-baseline text-sm no-underline shadow-sm transition-colors"
>
	<img src="/wiki-favicon.ico" alt="" class="size-4 rounded-sm" />
	<span class="font-medium">{node.pageName || 'Hypixel SkyBlock Wiki'}</span>
	<ExternalLink class="text-muted-foreground size-3.5 shrink-0" />
</a>
