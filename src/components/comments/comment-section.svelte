<script lang="ts">
	import type { CommentResponse } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { Separator } from '$ui/separator';
	import CommentEditor from './comment-editor.svelte';
	import CommentThread from './comment-thread.svelte';

	interface Props {
		comments?: CommentResponse[];
		userId?: string;
		isModerator?: boolean;
		isLoading?: boolean;
		onSubmit?: (parentId: number | null, content: string) => void;
		onEdit?: (commentId: number, content: string) => void;
		onDelete?: (commentId: number) => void;
		onVoteUp?: (commentId: number) => void;
		onVoteDown?: (commentId: number) => void;
	}

	let {
		comments = [],
		userId,
		isModerator = false,
		isLoading = false,
		onSubmit,
		onEdit,
		onDelete,
		onVoteUp,
		onVoteDown,
	}: Props = $props();

	const commentCount = $derived(comments.length);
	const rootCommentCount = $derived(comments.filter((c) => !c.parentId).length);

	const gbl = getGlobalContext();
</script>

<section class="flex w-full flex-col gap-4">
	<!-- Header -->
	<div class="flex flex-col gap-1">
		<h2 class="text-xl font-semibold">
			{commentCount === 0
				? 'No comments yet'
				: `${rootCommentCount} ${rootCommentCount === 1 ? 'comment' : 'comments'}`}
		</h2>
		<p class="text-muted-foreground text-sm">
			{commentCount > rootCommentCount
				? `${commentCount - rootCommentCount} ${commentCount - rootCommentCount === 1 ? 'reply' : 'replies'}`
				: 'Be the first to comment'}
		</p>
	</div>

	<Separator />

	<!-- Root comment composer -->
	{#if gbl.authorized}
		<CommentEditor
			placeholder="Share your thoughts..."
			{isLoading}
			onSubmit={(content) => onSubmit?.(null, content)}
		/>
		<Separator />
	{:else}
		<p class="text-muted-foreground text-sm italic">Sign in to post a comment</p>
		<Separator />
	{/if}

	<!-- Comments thread -->
	{#if commentCount > 0}
		<CommentThread {comments} {userId} {isModerator} {onSubmit} {onEdit} {onDelete} {onVoteUp} {onVoteDown} />
	{/if}
</section>
