import { command, getRequestEvent, query } from '$app/server';
import {
	adminPendingGuides,
	approveComment,
	approveGuide,
	createTag,
	deleteTag,
	listPendingComments,
	listTags,
	rejectGuide,
	updateTag,
} from '$lib/api';
import type { CreateTagRequest, RejectGuideRequest, UpdateTagRequest } from '$lib/api/schemas';
import { error } from '@sveltejs/kit';
import * as z from 'zod';

/**
 * Query: Get all pending guides awaiting moderation
 */
export const GetPendingGuides = query(async () => {
	const event = getRequestEvent();
	if (!event.locals.access_token || !event.locals.session?.perms.moderator) {
		error(403, 'Insufficient permissions');
	}

	const result = await adminPendingGuides();

	if (result.response.status === 403) {
		error(403, 'Insufficient permissions');
	}

	if (!result.ok) {
		error(result.response.status, 'Failed to fetch pending guides');
	}

	return result.data;
});

/**
 * Query: Get all available guide tags
 */
export const ListAdminTags = query(async () => {
	const result = await listTags();
	if (!result.ok) {
		error(result.response.status, 'Failed to fetch tags');
	}
	return result.data;
});

/**
 * Query: Get all pending comments awaiting moderation
 */
export const GetPendingComments = query(async () => {
	const event = getRequestEvent();
	if (!event.locals.access_token || !event.locals.session?.perms.moderator) {
		error(403, 'Insufficient permissions');
	}

	const result = await listPendingComments();

	if (result.response.status === 403) {
		error(403, 'Insufficient permissions');
	}

	if (!result.ok) {
		error(result.response.status, 'Failed to fetch pending comments');
	}

	return result.data;
});

/**
 * Command: Approve and publish a pending guide
 */
export const approveGuideCommand = command(z.number(), async (guideId) => {
	const event = getRequestEvent();
	if (!event.locals.access_token || !event.locals.session?.perms.moderator) {
		return { error: 'Insufficient permissions' };
	}

	const result = await approveGuide(guideId);

	if (result.response.status === 403) {
		return { error: 'Insufficient permissions' };
	}

	if (!result.ok) {
		return { error: 'Failed to approve guide' };
	}

	// Refresh pending guides list
	GetPendingGuides().refresh();

	return { error: null };
});

/**
 * Command: Reject a pending guide with a reason
 */
export const rejectGuideCommand = command(
	z.object({
		guideId: z.number(),
		reason: z.string().min(1).max(500),
	}),
	async ({ guideId, reason }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token || !event.locals.session?.perms.moderator) {
			return { error: 'Insufficient permissions' };
		}

		const request: RejectGuideRequest = { reason };
		const result = await rejectGuide(guideId, request);

		if (result.response.status === 403) {
			return { error: 'Insufficient permissions' };
		}

		if (!result.ok) {
			return { error: 'Failed to reject guide' };
		}

		// Refresh pending guides list
		GetPendingGuides().refresh();

		return { error: null };
	}
);

/**
 * Command: Approve a pending comment
 */
export const approveCommentCommand = command(z.number(), async (commentId) => {
	const event = getRequestEvent();
	if (!event.locals.access_token || !event.locals.session?.perms.moderator) {
		return { error: 'Insufficient permissions' };
	}

	const result = await approveComment(commentId);

	if (result.response.status === 403) {
		return { error: 'Insufficient permissions' };
	}

	if (!result.ok) {
		return { error: 'Failed to approve comment' };
	}

	// Refresh pending comments list
	GetPendingComments().refresh();

	return { error: null };
});

/**
 * Command: Create a new guide tag
 */
export const createTagCommand = command(
	z.object({
		name: z.string().min(1).max(50),
		category: z.string().min(1),
		color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
	}),
	async ({ name, category, color }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token || !event.locals.session?.perms.moderator) {
			return { error: 'Insufficient permissions', tag: null };
		}

		const request: CreateTagRequest = { name, category, hexColor: color };
		const result = await createTag(request);

		if (result.response.status === 403) {
			return { error: 'Insufficient permissions', tag: null };
		}

		if (!result.ok) {
			return { error: 'Failed to create tag', tag: null };
		}

		// Refresh tags list
		ListAdminTags().refresh();

		return { error: null, tag: result.data };
	}
);

/**
 * Command: Update an existing guide tag
 */
export const updateTagCommand = command(
	z.object({
		id: z.number(),
		name: z.string().min(1).max(50),
		category: z.string().min(1),
		color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
	}),
	async ({ id, name, category, color }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token || !event.locals.session?.perms.moderator) {
			return { error: 'Insufficient permissions', tag: null };
		}

		const request: UpdateTagRequest = { name, category, hexColor: color };
		const result = await updateTag(id, request);

		if (result.response.status === 403) {
			return { error: 'Insufficient permissions', tag: null };
		}

		if (!result.ok) {
			return { error: 'Failed to update tag', tag: null };
		}

		// Refresh tags list
		ListAdminTags().refresh();

		return { error: null, tag: result.data };
	}
);

/**
 * Command: Delete a guide tag
 */
export const deleteTagCommand = command(z.number(), async (id) => {
	const event = getRequestEvent();
	if (!event.locals.access_token || !event.locals.session?.perms.moderator) {
		return { error: 'Insufficient permissions' };
	}

	const result = await deleteTag(id);

	if (result.response.status === 403) {
		return { error: 'Insufficient permissions' };
	}

	if (!result.ok) {
		return { error: 'Failed to delete tag' };
	}

	// Refresh tags list
	ListAdminTags().refresh();

	return { error: null };
});
