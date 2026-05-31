<script lang="ts">
	import RenderMd from '$comp/markdown/render-md.svelte';
	import type { CommentWithGuideAuthor } from '$lib/guides/types';
	import { Badge } from '$ui/badge';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Pin from '@lucide/svelte/icons/pin';

	interface Props {
		comment: CommentWithGuideAuthor;
	}

	let { comment }: Props = $props();
</script>

<div class="not-prose border-primary/30 bg-primary/5 my-3 rounded-md border p-3 text-sm">
	<div class="mb-2 flex flex-wrap items-center gap-2">
		<Pin class="text-primary size-4 rotate-45 fill-current" />
		<span class="font-medium">Pinned comment</span>
		<span class="text-muted-foreground">from {comment.author.name}</span>
		{#if comment.isGuideAuthor}
			<Badge variant="secondary" class="px-1.5 py-0 text-[10px]">Author</Badge>
		{/if}
	</div>
	<div class="text-foreground">
		<RenderMd content={comment.content} />
	</div>

	<div class="mt-1 flex flex-row items-center gap-1">
		<a href="#comment-{comment.sqid}" class="text-primary ml-auto text-xs font-semibold hover:underline"
			>Jump to thread</a
		>
		<ArrowRight class="size-4" />
	</div>
</div>
