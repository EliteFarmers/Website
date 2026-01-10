import { command, getRequestEvent, query } from '$app/server';
import {
	bookmarkGuide,
	createGuide,
	deleteGuide,
	getGuide,
	getUserBookmarks,
	getUserGuides,
	listGuides,
	listTags,
	submitGuideForApproval,
	unbookmarkGuide,
	unpublishGuide,
	updateGuide,
	voteGuide,
} from '$lib/api';
import type {
	CreateGuideRequest,
	GetGuideParams,
	GuideSort,
	GuideType,
	ListGuidesParams,
	UpdateGuideRequest,
	VoteGuideRequest,
} from '$lib/api/schemas';
import { error } from '@sveltejs/kit';
import * as z from 'zod';

/**
 * Query: List all available guide tags
 */
export const ListTags = query(async () => {
	const result = await listTags();
	if (!result.ok) {
		error(result.response.status, 'Failed to fetch tags');
	}
	return result.data;
});

/**
 * Query: Get a specific guide by slug (supports draft mode)
 */
export const GetGuide = query(
	z.object({
		slug: z.string(),
		draft: z.boolean().optional().default(false),
	}),
	async ({ slug, draft }) => {
		const params: GetGuideParams = { draft };
		const result = await getGuide(slug, params);

		if (result.response.status === 404) {
			error(404, 'Guide not found');
		}

		if (!result.ok) {
			error(result.response.status, 'Failed to fetch guide');
		}

		return result.data;
	}
);

/**
 * Query: List guides with filtering, sorting, and search
 */
export const ListGuides = query(
	z.object({
		query: z.string().optional(),
		tags: z.array(z.coerce.number().int()).optional(),
		type: z.coerce.number().int().optional(),
		sort: z.coerce.number().int().optional().default(0),
		page: z.coerce.number().int().optional().default(0),
		pageSize: z.coerce.number().int().optional().default(20),
	}),
	async ({ query: q, tags, type, sort, page, pageSize }) => {
		const params: ListGuidesParams = {
			sort: sort as GuideSort,
			page,
			pageSize,
			...(q ? { query: q } : {}),
			...(tags?.length ? { tags } : {}),
			...(typeof type === 'number' ? { type: type as GuideType } : {}),
		};

		const result = await listGuides(params);
		if (!result.ok) {
			error(result.response.status, 'Failed to fetch guides');
		}
		return result.data;
	}
);

/**
 * Query: Get all guides for a specific user
 */
export const GetUserGuides = query(z.union([z.string(), z.bigint(), z.number()]), async (accountId) => {
	const result = await getUserGuides(accountId);
	if (!result.ok) {
		error(result.response.status, 'Failed to fetch user guides');
	}
	return result.data;
});

/**
 * Query: Get bookmarked guides for the current user (owner-only)
 */
export const GetUserBookmarks = query(z.union([z.string(), z.bigint(), z.number()]), async (accountId) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		error(401, 'Unauthorized');
	}

	const result = await getUserBookmarks(accountId);
	if (result.response.status === 401) {
		error(401, 'Unauthorized');
	}
	if (!result.ok) {
		error(result.response.status, 'Failed to fetch bookmarks');
	}
	return result.data;
});

/**
 * Command: Create a new guide draft
 */
export const createGuideCommand = command(z.string(), async (type: string) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		return { error: 'Unauthorized', guide: null };
	}

	const request: CreateGuideRequest = { type: Number(type) as GuideType };
	const result = await createGuide(request);

	if (result.response.status === 401) {
		return { error: 'Unauthorized', guide: null };
	}

	if (!result.ok) {
		return { error: 'Failed to create guide', guide: null };
	}

	return { error: null, guide: result.data };
});

/**
 * Command: Update guide draft
 */
export const updateGuideCommand = command(
	z.object({
		id: z.number(),
		title: z.string().min(1),
		description: z.string().min(1),
		markdownContent: z.string(),
		richBlocks: z.any().optional(),
		skyblockIconId: z.string().optional(),
		tags: z.array(z.string()).optional(),
	}),
	async ({ id, title, description, markdownContent, richBlocks, skyblockIconId, tags }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized' };
		}

		const request: UpdateGuideRequest = {
			title,
			description,
			markdownContent,
			...(richBlocks && { richBlocks }),
			...(skyblockIconId && { skyblockIconId }),
			...(tags && { tags }),
		};

		const result = await updateGuide(id, request);

		if (result.response.status === 401) {
			return { error: 'Unauthorized' };
		}

		if (!result.ok) {
			return { error: 'Failed to update guide' };
		}

		// Refresh the guide data after update
		GetGuide({ slug: '', draft: true }).refresh();

		return { error: null };
	}
);

/**
 * Command: Submit guide for approval
 */
export const submitGuideForApprovalCommand = command(z.number(), async (guideId) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		return { error: 'Unauthorized' };
	}

	const result = await submitGuideForApproval(guideId);

	if (result.response.status === 401) {
		return { error: 'Unauthorized' };
	}

	if (!result.ok) {
		return { error: 'Failed to submit guide' };
	}

	return { error: null };
});

/**
 * Command: Delete a guide
 */
export const deleteGuideCommand = command(z.number(), async (guideId) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		return { error: 'Unauthorized' };
	}

	const result = await deleteGuide(guideId);

	if (result.response.status === 401) {
		return { error: 'Unauthorized' };
	}

	if (result.response.status === 403) {
		return { error: 'You do not have permission to delete this guide' };
	}

	if (!result.ok) {
		return { error: 'Failed to delete guide' };
	}

	return { error: null };
});

/**
 * Command: Unpublish a guide (revert to draft)
 */
export const unpublishGuideCommand = command(z.number(), async (guideId) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		return { error: 'Unauthorized' };
	}

	const result = await unpublishGuide(guideId);

	if (result.response.status === 401) {
		return { error: 'Unauthorized' };
	}

	if (result.response.status === 403) {
		return { error: 'You do not have permission to unpublish this guide' };
	}

	if (!result.ok) {
		return { error: 'Failed to unpublish guide' };
	}

	return { error: null };
});

/**
 * Command: Vote on a guide (+1 or -1)
 * Uses optimistic UI - caller should update local state immediately
 */
export const voteGuideCommand = command(
	z.object({
		guideId: z.number(),
		value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
	}),
	async ({ guideId, value }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized' };
		}

		const request: VoteGuideRequest = { value };
		const result = await voteGuide(guideId, request);

		if (result.response.status === 401) {
			return { error: 'Unauthorized' };
		}

		if (!result.ok) {
			return { error: 'Failed to vote on guide' };
		}

		return { error: null };
	}
);

/**
 * Command: Bookmark a guide
 */
export const bookmarkGuideCommand = command(z.number(), async (guideId) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		return { error: 'Unauthorized' };
	}

	const result = await bookmarkGuide(guideId);

	if (result.response.status === 401) {
		return { error: 'Unauthorized' };
	}

	if (!result.ok) {
		return { error: 'Failed to bookmark guide' };
	}

	// Refresh bookmarks list
	GetUserBookmarks(BigInt(0)).refresh();

	return { error: null };
});

/**
 * Command: Remove bookmark from a guide
 */
export const unbookmarkGuideCommand = command(z.number(), async (guideId) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		return { error: 'Unauthorized' };
	}

	const result = await unbookmarkGuide(guideId);

	if (result.response.status === 401) {
		return { error: 'Unauthorized' };
	}

	if (!result.ok) {
		return { error: 'Failed to remove bookmark' };
	}

	// Refresh bookmarks list
	GetUserBookmarks(BigInt(0)).refresh();

	return { error: null };
});
