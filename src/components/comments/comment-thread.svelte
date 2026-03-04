<script lang="ts">
	import type { CommentDto } from '$lib/api';
	import CommentEditor from './comment-editor.svelte';
	import CommentItem from './comment-item.svelte';
	import CommentThread from './comment-thread.svelte';

	interface Props {
		comments: CommentDto[];
		parentId?: number | null;
		userId?: string;
		isModerator?: boolean;
		onSubmit?: (parentId: number | null, content: string) => void;
		onEdit?: (commentId: number, content: string) => void;
		onDelete?: (commentId: number) => void;
		onVoteUp?: (commentId: number) => void;
		onVoteDown?: (commentId: number) => void;
	}

	let {
		comments = [],
		parentId = null,
		userId,
		isModerator = false,
		onSubmit,
		onEdit,
		onDelete,
		onVoteUp,
		onVoteDown,
	}: Props = $props();

	// Track expanded state per comment
	let expandedMap = $state<Record<number, boolean>>({});
	let replyingMap = $state<Record<number, boolean>>({});

	function toggleCollapse(commentId: number) {
		expandedMap[commentId] = !(expandedMap[commentId] ?? true);
	}

	function toggleReply(commentId: number) {
		replyingMap[commentId] = !(replyingMap[commentId] ?? false);
	}

	let threadComments = $derived(comments.filter((c) => (c.parentId ?? null) === parentId));

	let childCountMap = $derived.by(() => {
		const map: Record<number, number> = {};
		for (const c of threadComments) {
			map[c.id] = comments.filter((child) => (child.parentId ?? null) === c.id).length;
		}
		return map;
	});
</script>

<div class="flex flex-col gap-5">
	{#each threadComments as comment (comment.id)}
		<div class="flex flex-col gap-5">
			<CommentItem
				{comment}
				childCount={childCountMap[comment.id] ?? 0}
				isExpanded={expandedMap[comment.id] ?? true}
				onReply={() => toggleReply(comment.id)}
				onEdit={(content) => onEdit?.(comment.id, content)}
				onDelete={() => onDelete?.(comment.id)}
				onVoteUp={() => onVoteUp?.(comment.id)}
				onVoteDown={() => onVoteDown?.(comment.id)}
				onToggleCollapse={() => toggleCollapse(comment.id)}
			/>

			<!-- Reply composer -->
			{#if replyingMap[comment.id]}
				<div class="ml-6">
					<CommentEditor
						placeholder="Write a reply..."
						onSubmit={(content) => {
							onSubmit?.(comment.id, content);
							toggleReply(comment.id);
						}}
						onCancel={() => toggleReply(comment.id)}
					/>
				</div>
			{/if}

			<!-- Child comments -->
			{#if (expandedMap[comment.id] ?? true) && (childCountMap[comment.id] ?? 0) > 0}
				<div class="ml-6">
					<CommentThread
						{comments}
						parentId={comment.id}
						{userId}
						{isModerator}
						{onSubmit}
						{onEdit}
						{onDelete}
						{onVoteUp}
						{onVoteDown}
					/>
				</div>
			{/if}
		</div>
	{/each}
</div>
