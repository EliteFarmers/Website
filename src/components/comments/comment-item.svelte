<script lang="ts">
	import RenderMd from '$comp/markdown/render-md.svelte';
	import type { CommentResponse } from '$lib/api';
	import { Button } from '$ui/button';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import CommentActions from './comment-actions.svelte';
	import CommentEditor from './comment-editor.svelte';
	import CommentMetadata from './comment-metadata.svelte';
	import CommentVote from './comment-vote.svelte';

	interface Props {
		comment: CommentResponse;
		childCount?: number;
		isExpanded?: boolean;
		onReply?: () => void;
		onEdit?: (content: string) => void;
		onDelete?: () => void;
		onVoteUp?: () => void;
		onVoteDown?: () => void;
		onToggleCollapse?: () => void;
	}

	let {
		comment,
		childCount = 0,
		isExpanded = true,
		onReply,
		onEdit,
		onDelete,
		onVoteUp,
		onVoteDown,
		onToggleCollapse,
	}: Props = $props();

	let isEditing = $state(false);
</script>

<div class="flex flex-col gap-2">
	<!-- Comment body with left border -->
	<div class="flex flex-row gap-2">
		<!-- Collapse button and left border -->
		{#if childCount && childCount > 0}
			<div class="flex flex-col items-center gap-0.5">
				<Button
					variant="ghost"
					size="sm"
					onclick={onToggleCollapse}
					class="text-muted-foreground hover:text-foreground h-5 w-5 p-0"
				>
					{#if isExpanded}
						<ChevronDown size={14} />
					{:else}
						<ChevronRight size={14} />
					{/if}
				</Button>
				{#if isExpanded}
					<div class="bg-border w-0.5 flex-1"></div>
				{/if}
			</div>
		{:else}
			<!-- Empty spacer for alignment -->
			<div class="w-5"></div>
		{/if}

		<!-- Comment content -->
		<div class="flex min-w-0 flex-1 flex-col gap-2">
			<!-- Header: metadata and actions -->
			<div class="flex flex-row items-center justify-between gap-2">
				<CommentMetadata {comment} />
				<CommentActions {comment} onEdit={() => (isEditing = true)} {onDelete} />
			</div>

			<!-- Comment content or editor -->
			{#if isEditing}
				<CommentEditor
					value={comment.content}
					isEditing={true}
					onSubmit={(content) => {
						onEdit?.(content);
						isEditing = false;
					}}
					onCancel={() => (isEditing = false)}
				/>
			{:else}
				<div class="text-foreground text-sm">
					<RenderMd content={comment.content} />
				</div>
			{/if}

			<!-- Footer: votes and child indicator -->
			<div class="flex flex-row items-center gap-2">
				<CommentVote
					score={comment.score}
					userVote={comment.userVote}
					disabled={comment.isDeleted}
					{onVoteUp}
					{onVoteDown}
				/>

				{#if onReply}
					<Button
						variant="ghost"
						size="sm"
						onclick={onReply}
						class="text-muted-foreground hover:text-foreground h-6 px-2 text-xs"
					>
						<MessageSquare size={14} />
						Reply
					</Button>
				{/if}

				{#if childCount && childCount > 0 && !isExpanded}
					<Button
						variant="ghost"
						size="sm"
						onclick={onToggleCollapse}
						class="text-muted-foreground hover:text-foreground p-0"
					>
						<span class="text-muted-foreground text-xs">
							{childCount}
							{childCount === 1 ? 'reply' : 'replies'}
						</span>
					</Button>
				{/if}
			</div>
		</div>
	</div>
</div>
