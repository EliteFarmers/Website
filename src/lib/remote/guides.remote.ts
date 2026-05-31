import { command, form, getRequestEvent, query } from '$app/server';
import {
	bookmarkGuide,
	createGuide,
	deleteGuide,
	deleteGuideAsset,
	getAccount,
	getGuide,
	getUserBookmarks,
	getUserGuides,
	listGuideAssets,
	listGuideHistory,
	listGuides,
	listTags,
	replaceGuideAuthors,
	restoreGuideVersion,
	submitGuideForApproval,
	unbookmarkGuide,
	unpublishGuide,
	updateGuide,
	uploadGuideImage,
	uploadGuideLitematic,
	voteGuide,
} from '$lib/api';
import type {
	CreateGuideRequest,
	GetGuideParams,
	GuideAssetDto,
	GuideSort,
	GuideType,
	ListGuidesParams,
	ReplaceGuideAuthorsRequest,
	UpdateGuideRequest,
	VoteGuideRequest,
} from '$lib/api/schemas';
import { error } from '@sveltejs/kit';
import * as z from 'zod';

type GuideAssetFormResult = { error: string | null; asset: GuideAssetDto | null };
type UploadGuideImageFormInput = {
	guideId: string | number;
	title?: string;
	description?: string;
	image: File;
};
type UploadGuideLitematicFormInput = {
	guideId: string | number;
	displayName?: string;
	file: File;
};

function apiErrorMessage(data: unknown, fallback: string) {
	if (!data || typeof data !== 'object') {
		return fallback;
	}

	const record = data as Record<string, unknown>;
	const errorMessage = firstErrorMessage(record.errors);
	if (errorMessage) return errorMessage;

	if (typeof record.message === 'string' && record.message.trim().length > 0) return record.message;
	if (typeof record.detail === 'string' && record.detail.trim().length > 0) return record.detail;
	if (typeof record.title === 'string' && record.title.trim().length > 0) return record.title;

	return fallback;
}

function firstErrorMessage(errors: unknown): string | null {
	if (!errors || typeof errors !== 'object') return null;

	for (const value of Object.values(errors as Record<string, unknown>)) {
		if (Array.isArray(value)) {
			const message = value.find(
				(entry): entry is string => typeof entry === 'string' && entry.trim().length > 0
			);
			if (message) return message;
		}

		if (typeof value === 'string' && value.trim().length > 0) return value;
	}

	return null;
}

function optionalText(value: unknown) {
	const text = typeof value === 'string' ? value.trim() : '';
	return text.length > 0 ? text : null;
}

function parseGuideId(value: string | number) {
	const guideId = Number(value);
	return Number.isInteger(guideId) && guideId > 0 ? guideId : null;
}

function getUploadedFile(value: unknown) {
	return value instanceof File && value.size > 0 ? value : null;
}

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
		sort: z.string().optional().default('topRated'),
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
 * Query: List uploaded guide images and litematics for the editor
 */
export const GetGuideAssets = query(z.number(), async (guideId) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		error(401, 'Unauthorized');
	}

	const result = await listGuideAssets(guideId);
	if (result.response.status === 401) {
		error(401, 'Unauthorized');
	}
	if (result.response.status === 403) {
		error(403, 'Insufficient permissions');
	}
	if (!result.ok) {
		error(result.response.status, 'Failed to fetch guide assets');
	}
	return result.data ?? [];
});

/**
 * Query: List guide save history for editors
 */
export const GetGuideHistory = query(z.number(), async (guideId) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		error(401, 'Unauthorized');
	}

	const result = await listGuideHistory(guideId);
	if (result.response.status === 401) {
		error(401, 'Unauthorized');
	}
	if (result.response.status === 403) {
		error(403, 'Insufficient permissions');
	}
	if (!result.ok) {
		error(result.response.status, 'Failed to fetch guide history');
	}
	return result.data ?? [];
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
		iconSkyblockId: z.string().nullable().optional(),
		tags: z.array(z.string()).optional(),
		concurrency: z.number(),
	}),
	async ({ id, title, description, markdownContent, richBlocks, iconSkyblockId, tags, concurrency }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized' };
		}

		const request: UpdateGuideRequest = {
			title,
			description,
			markdownContent,
			concurrencyVersion: concurrency,
		};

		if (iconSkyblockId !== undefined) {
			request.iconSkyblockId = iconSkyblockId;
		}

		if (tags !== undefined) {
			request.tags = tags;
		}

		if (richBlocks !== undefined) {
			request.richBlocks = richBlocks;
		}

		const result = await updateGuide(id, request);

		if (result.response.status === 401) {
			return { error: 'Unauthorized' };
		}

		if (!result.ok) {
			console.error('Update guide failed:', {
				status: result.response.status,
				statusText: result.response.statusText,
				body: request,
			});
			return { error: apiErrorMessage(result.error, 'Failed to update guide') };
		}

		return { error: null, version: result.data.concurrencyVersion };
	}
);

/**
 * Command: Restore an older guide save into the current draft
 */
export const restoreGuideVersionCommand = command(
	z.object({
		guideId: z.number(),
		versionId: z.number(),
	}),
	async ({ guideId, versionId }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized', version: null };
		}

		const result = await restoreGuideVersion(guideId, versionId);

		if (result.response.status === 401) {
			return { error: 'Unauthorized', version: null };
		}
		if (result.response.status === 403) {
			return { error: 'You do not have permission to restore this guide', version: null };
		}
		if (!result.ok) {
			return { error: 'Failed to restore guide revision', version: null };
		}

		GetGuideHistory(guideId).refresh();
		return { error: null, version: result.data.concurrencyVersion };
	}
);

/**
 * Command: Replace owner and editor author list
 */
export const replaceGuideAuthorsCommand = command(
	z.object({
		guideId: z.number(),
		ownerId: z.string().min(1),
		editorIds: z.array(z.string()).max(3),
	}),
	async ({ guideId, ownerId, editorIds }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized' };
		}

		const request: ReplaceGuideAuthorsRequest = {
			ownerId,
			editorIds: editorIds as unknown as ReplaceGuideAuthorsRequest['editorIds'],
		};
		const result = await replaceGuideAuthors(guideId, request);

		if (result.response.status === 401) {
			return { error: 'Unauthorized' };
		}
		if (result.response.status === 403) {
			return { error: 'You do not have permission to manage authors' };
		}
		if (!result.ok) {
			return { error: apiErrorMessage(result.error, 'Failed to update guide authors') };
		}

		return { error: null };
	}
);

/**
 * Command: Resolve a Minecraft username into a linked Elite account.
 */
export const resolveGuideAuthorCommand = command(z.string().min(1).max(32), async (username) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		return { error: 'Unauthorized', account: null };
	}

	const player = username.trim().replace(/[^a-zA-Z0-9_]/g, '');
	if (!player) {
		return { error: 'Enter a valid Minecraft username', account: null };
	}

	const result = await getAccount(player);
	if (!result.ok) {
		return { error: apiErrorMessage(result.error, 'Minecraft account not found'), account: null };
	}

	if (!result.data.discordId) {
		return { error: 'That Minecraft account is not linked to an Elite account', account: null };
	}

	return {
		error: null,
		account: {
			id: result.data.discordId,
			name: result.data.formattedName || result.data.name,
			uuid: result.data.id,
		},
	};
});

/**
 * Form: Upload a guide image through the generated API client
 */
export const uploadGuideImageForm = form<UploadGuideImageFormInput, GuideAssetFormResult>(
	'unchecked',
	async ({ guideId: rawGuideId, title, description, image }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized', asset: null };
		}

		const guideId = parseGuideId(rawGuideId);
		const file = getUploadedFile(image);
		if (!guideId || !file) {
			return { error: 'Select an image to upload', asset: null };
		}

		const result = await uploadGuideImage(guideId, {
			image: file,
			title: optionalText(title),
			description: optionalText(description),
		});

		if (result.response.status === 401) {
			return { error: 'Unauthorized', asset: null };
		}
		if (result.response.status === 403) {
			return { error: 'You do not have permission to upload assets for this guide', asset: null };
		}
		if (!result.ok) {
			return { error: apiErrorMessage(result.data, 'Failed to upload image'), asset: null };
		}

		GetGuideAssets(guideId).refresh();
		return { error: null, asset: result.data };
	}
);

/**
 * Form: Upload a guide litematic through the generated API client
 */
export const uploadGuideLitematicForm = form<UploadGuideLitematicFormInput, GuideAssetFormResult>(
	'unchecked',
	async ({ guideId: rawGuideId, displayName, file }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized', asset: null };
		}

		const guideId = parseGuideId(rawGuideId);
		const upload = getUploadedFile(file);
		if (!guideId || !upload) {
			return { error: 'Select a litematic file to upload', asset: null };
		}

		const result = await uploadGuideLitematic(guideId, {
			file: upload,
			displayName: optionalText(displayName),
		});

		if (result.response.status === 401) {
			return { error: 'Unauthorized', asset: null };
		}
		if (result.response.status === 403) {
			return { error: 'You do not have permission to upload assets for this guide', asset: null };
		}
		if (!result.ok) {
			return { error: apiErrorMessage(result.data, 'Failed to upload litematic'), asset: null };
		}

		GetGuideAssets(guideId).refresh();
		return { error: null, asset: result.data };
	}
);

/**
 * Command: Delete a guide asset through the generated API client
 */
export const deleteGuideAssetCommand = command(
	z.object({
		guideId: z.number(),
		assetId: z.string().min(1),
	}),
	async ({ guideId, assetId }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized' };
		}

		const result = await deleteGuideAsset(guideId, assetId);

		if (result.response.status === 401) {
			return { error: 'Unauthorized' };
		}
		if (result.response.status === 403) {
			return { error: 'You do not have permission to delete this asset' };
		}
		if (!result.ok) {
			return { error: 'Failed to delete asset' };
		}

		GetGuideAssets(guideId).refresh();
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
