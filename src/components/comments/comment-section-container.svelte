<script lang="ts">
	import type { CommentDto } from '$lib/api';
	import {
		createCommentCommand,
		deleteCommentCommand,
		editCommentCommand,
		GetGuideComments,
		voteCommentCommand,
	} from '$lib/remote/comments.remote';
	import { useDebounce } from 'runed';
	import CommentSection from './comment-section.svelte';

	type Session =
		| {
				ign?: string;
				perms?: { moderator?: boolean };
		  }
		| null
		| undefined;

	type Props = {
		guideId: number;
		commentsPromise: ReturnType<typeof GetGuideComments>;
		session: Session;
		notifyError?: (message: string) => void;
		notifySuccess?: (message: string) => void;
	};

	let {
		guideId,
		commentsPromise,
		session,
		notifyError = (message: string) => console.error(message),
		notifySuccess = (message: string) => console.info(message),
	}: Props = $props();

	let isLoadingComment = $state(false);
	let commentVotes = $state<Record<number, 1 | -1 | 0>>({});
	let pendingCommentVoteRequests = $state<Record<number, 1 | -1 | 0>>({});

	function getCommentList(): CommentDto[] {
		const current = commentsPromise.current;
		return Array.isArray(current) ? current : [];
	}

	function applyOptimisticCommentVotes(comments: CommentDto[]) {
		return comments.map((c) => {
			const overrideVote = commentVotes[c.id];
			if (overrideVote === undefined) return c;

			const baseVote = c.userVote ?? 0;
			const delta = overrideVote - baseVote;
			return {
				...c,
				score: c.score + delta,
				userVote: overrideVote === 0 ? null : overrideVote,
			};
		});
	}

	const flushCommentVotes = useDebounce(async () => {
		const batch = pendingCommentVoteRequests;
		const ids = Object.keys(batch);
		if (!ids.length) return;

		pendingCommentVoteRequests = {};

		for (const idStr of ids) {
			const commentId = Number(idStr);
			const value = batch[commentId];
			if (value === undefined) continue;

			const result = await voteCommentCommand({ commentId, value });
			if (result.error) {
				notifyError(result.error);
			}
		}

		// Sync from server and clear local vote overrides
		commentsPromise.refresh();
		commentVotes = {};
	}, 400);

	async function handlePostComment(content: string, parentId?: number) {
		if (!content.trim()) {
			notifyError('Comment cannot be empty');
			return;
		}

		if (!session) {
			notifyError('Please log in to comment');
			return;
		}

		isLoadingComment = true;

		const trimmedContent = content.trim();

		try {
			const result = await createCommentCommand({ guideId, content: trimmedContent, parentId }).updates(
				commentsPromise
			);

			if (result.error) {
				notifyError(result.error);
				return;
			}

			notifySuccess('Comment posted!');
		} catch (err) {
			notifyError('Failed to post comment');
			console.error(err);
		} finally {
			isLoadingComment = false;
		}
	}

	async function handleEditComment(commentId: number, content: string) {
		if (!content.trim()) {
			notifyError('Comment cannot be empty');
			return;
		}

		const result = await editCommentCommand({ commentId, content: content.trim() });

		if (result.error) {
			notifyError(result.error);
			return;
		}

		notifySuccess('Comment updated!');
		commentsPromise.refresh();
	}

	async function handleDeleteComment(commentId: number) {
		const result = await deleteCommentCommand(commentId).updates(commentsPromise);

		if (result.error) {
			notifyError(result.error);
			return;
		}

		notifySuccess('Comment deleted');
	}

	function handleVoteComment(commentId: number, value: 1 | -1) {
		if (!session) {
			notifyError('Please log in to vote');
			return;
		}

		const baseList = getCommentList();
		const baseVote = baseList.find((c) => c.id === commentId)?.userVote ?? 0;
		const oldVote: 1 | -1 | 0 = commentVotes[commentId] ?? (baseVote === 1 ? 1 : baseVote === -1 ? -1 : 0);
		const nextVote: 1 | -1 | 0 = oldVote === value ? 0 : value;

		commentVotes = { ...commentVotes, [commentId]: nextVote };
		pendingCommentVoteRequests = { ...pendingCommentVoteRequests, [commentId]: nextVote };
		flushCommentVotes();
	}

	let isModerator = $derived(session?.perms?.moderator ?? false);
	let baseComments = $derived.by(getCommentList);
	let displayComments = $derived(applyOptimisticCommentVotes(baseComments));
</script>

<svelte:boundary>
	<CommentSection
		comments={displayComments}
		userId={session?.ign}
		{isModerator}
		isLoading={isLoadingComment}
		onSubmit={async (parentId, content) => {
			await handlePostComment(content, parentId ?? undefined);
		}}
		onEdit={async (commentId, content) => {
			await handleEditComment(commentId, content);
		}}
		onDelete={async (commentId) => {
			await handleDeleteComment(commentId);
		}}
		onVoteUp={(commentId) => {
			handleVoteComment(commentId, 1);
		}}
		onVoteDown={(commentId) => {
			handleVoteComment(commentId, -1);
		}}
	/>
	{#snippet failed(error, reset)}
		<div class="border-destructive/30 bg-destructive/5 rounded-md border p-3 text-sm">
			<p class="font-medium">Failed to load comments</p>
			{#if typeof error === 'object' && error && 'message' in error}
				<p class="text-muted-foreground mt-1">{error.message}</p>
			{/if}
			<button class="mt-2 rounded-md border px-3 py-1" onclick={reset}>Try again</button>
		</div>
	{/snippet}
</svelte:boundary>
