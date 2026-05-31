<script lang="ts">
	import RenderMd from '$comp/markdown/render-md.svelte';
	import type { CommentWithGuideAuthor } from '$lib/guides/types';
	import { Badge } from '$ui/badge';
	import MessageSquare from '@lucide/svelte/icons/message-square';

	interface Props {
		comment: CommentWithGuideAuthor;
	}

	let { comment }: Props = $props();
</script>

<div class="not-prose border-primary/30 bg-primary/5 my-3 rounded-md border p-3 text-sm">
	<div class="mb-2 flex flex-wrap items-center gap-2">
		<MessageSquare class="text-primary size-4" />
		<span class="font-medium">Pinned correction</span>
		<span class="text-muted-foreground">from {comment.author.name}</span>
		{#if comment.isGuideAuthor}
			<Badge variant="secondary" class="px-1.5 py-0 text-[10px]">OP</Badge>
		{/if}
		<a href="#comment-{comment.sqid}" class="text-primary ml-auto text-xs hover:underline">Open thread</a>
	</div>
	<div class="text-foreground">
		<RenderMd content={comment.content} />
	</div>
</div>
