import { command, getRequestEvent, query } from '$app/server';
import { env } from '$env/dynamic/private';
import { createComment, deleteComment, editComment, listComments, voteComment } from '$lib/api';
import { customFetch } from '$lib/api/custom-fetch';
import type { CreateCommentRequest, EditCommentRequest, VoteCommentRequest } from '$lib/api/schemas';
import { error } from '@sveltejs/kit';
import * as z from 'zod';

type ApiSuccess<T> = { status: 200; data: T } | { status: 204; data: null };
type ApiError = { status: 400 | 401 | 403 | 404 | 500; data: unknown };

function apiUrl(path: string) {
	return `${env.ELITE_API_URL}${path}`;
}

/**
 * Query: Get all comments for a guide
 */
export const GetGuideComments = query(z.string(), async (slug) => {
	const result = await listComments(slug);

	if (result.response.status === 404) {
		error(404, 'Guide not found');
	}

	if (!result.ok) {
		error(result.response.status, 'Failed to fetch comments');
	}

	return result.data;
});

/**
 * Command: Create a new comment on a guide
 */
export const createCommentCommand = command(
	z.object({
		guideId: z.number(),
		content: z.string().min(1).max(2048),
		parentId: z.number().optional(),
		liftedElementId: z.string().optional(),
	}),
	async ({ guideId, content, parentId, liftedElementId }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized', comment: null };
		}

		const request: CreateCommentRequest = {
			content,
			...(parentId && { parentId }),
			...(liftedElementId && { liftedElementId }),
		};

		const result = await createComment(guideId, request);

		if (result.response.status === 401) {
			return { error: 'Unauthorized', comment: null };
		}

		if (!result.ok) {
			return { error: 'Failed to create comment', comment: null };
		}

		return { error: null, comment: result.data };
	}
);

/**
 * Command: Hoist a comment near a guide heading or block
 */
export const hoistCommentCommand = command(
	z.object({
		guideId: z.number(),
		commentId: z.number(),
		liftedElementId: z.string().min(1).max(128),
	}),
	async ({ guideId, commentId, liftedElementId }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized' };
		}

		const result = await customFetch<ApiSuccess<null> | ApiError>(
			apiUrl(`/guides/${guideId}/comments/${commentId}/hoist`),
			{
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({ liftedElementId }),
			}
		);

		if (result.response.status === 401) {
			return { error: 'Unauthorized' };
		}
		if (result.response.status === 403) {
			return { error: 'You do not have permission to hoist this comment' };
		}
		if (!result.ok) {
			return { error: 'Failed to hoist comment' };
		}

		return { error: null };
	}
);

/**
 * Command: Remove a comment hoist placement
 */
export const clearHoistedCommentCommand = command(
	z.object({
		guideId: z.number(),
		commentId: z.number(),
	}),
	async ({ guideId, commentId }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized' };
		}

		const result = await customFetch<ApiSuccess<null> | ApiError>(
			apiUrl(`/guides/${guideId}/comments/${commentId}/hoist`),
			{
				method: 'DELETE',
			}
		);

		if (result.response.status === 401) {
			return { error: 'Unauthorized' };
		}
		if (result.response.status === 403) {
			return { error: 'You do not have permission to clear this hoist' };
		}
		if (!result.ok) {
			return { error: 'Failed to clear hoisted comment' };
		}

		return { error: null };
	}
);

/**
 * Command: Edit a comment
 */
export const editCommentCommand = command(
	z.object({
		commentId: z.number(),
		content: z.string().min(1).max(2048),
	}),
	async ({ commentId, content }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized' };
		}

		const request: EditCommentRequest = { content };
		const result = await editComment(commentId, request);

		if (result.response.status === 401) {
			return { error: 'Unauthorized' };
		}

		if (result.response.status === 403) {
			return { error: 'You do not have permission to edit this comment' };
		}

		if (!result.ok) {
			return { error: 'Failed to edit comment' };
		}

		return { error: null };
	}
);

/**
 * Command: Delete a comment (author or mod only)
 */
export const deleteCommentCommand = command(z.number(), async (commentId) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		return { error: 'Unauthorized' };
	}

	const result = await deleteComment(commentId);

	if (result.response.status === 401) {
		return { error: 'Unauthorized' };
	}

	if (result.response.status === 403) {
		return { error: 'You do not have permission to delete this comment' };
	}

	if (!result.ok) {
		return { error: 'Failed to delete comment' };
	}

	return { error: null };
});

/**
 * Command: Vote on a comment (+1, -1, or 0 to clear)
 * Uses optimistic UI - caller should update local state immediately
 */
export const voteCommentCommand = command(
	z.object({
		commentId: z.number(),
		value: z.literal(1).or(z.literal(-1)).or(z.literal(0)),
	}),
	async ({ commentId, value }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized' };
		}

		const request: VoteCommentRequest = { value };
		const result = await voteComment(commentId, request);

		if (result.response.status === 401) {
			return { error: 'Unauthorized' };
		}

		if (!result.ok) {
			return { error: 'Failed to vote on comment' };
		}

		return { error: null };
	}
);
