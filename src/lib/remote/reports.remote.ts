import { command, getRequestEvent, query } from '$app/server';
import { env } from '$env/dynamic/private';
import { customFetch } from '$lib/api/custom-fetch';
import type { ContentReportDto, ContentReportStatus, ContentReportTargetType } from '$lib/guides/types';
import { error } from '@sveltejs/kit';
import * as z from 'zod';

type ApiSuccess<T> = { status: 200; data: T } | { status: 204; data: null };
type ApiError = { status: 400 | 401 | 403 | 404 | 500; data: unknown };

function apiUrl(path: string) {
	return `${env.ELITE_API_URL}${path}`;
}

export const createContentReportCommand = command(
	z.object({
		targetType: z.enum(['Guide', 'Comment']),
		targetId: z.number(),
		reason: z.string().min(1).max(1000),
	}),
	async ({ targetType, targetId, reason }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized' };
		}

		const result = await customFetch<ApiSuccess<null> | ApiError>(apiUrl('/reports'), {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({ targetType, targetId, reason }),
		});

		if (result.response.status === 401) {
			return { error: 'Unauthorized' };
		}
		if (result.response.status === 404) {
			return { error: 'The reported content could not be found' };
		}
		if (!result.ok) {
			return { error: 'Failed to submit report' };
		}

		return { error: null };
	}
);

export const GetContentReports = query(
	z
		.object({
			status: z.enum(['Open', 'Reviewed', 'Dismissed']).nullable().optional(),
		})
		.optional(),
	async (params) => {
		const event = getRequestEvent();
		if (!event.locals.access_token || !event.locals.session?.perms.support) {
			error(403, 'Insufficient permissions');
		}

		const status = params?.status ?? 'Open';
		const search = status ? `?Status=${encodeURIComponent(status)}` : '';
		const result = await customFetch<ApiSuccess<ContentReportDto[]> | ApiError>(apiUrl(`/admin/reports${search}`));

		if (result.response.status === 403) {
			error(403, 'Insufficient permissions');
		}
		if (!result.ok) {
			error(result.response.status, 'Failed to fetch reports');
		}

		return result.data ?? [];
	}
);

export const resolveContentReportCommand = command(
	z.object({
		reportId: z.number(),
		status: z.enum(['Reviewed', 'Dismissed']),
		resolutionNote: z.string().max(1000).nullable().optional(),
	}),
	async ({ reportId, status, resolutionNote }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token || !event.locals.session?.perms.support) {
			return { error: 'Insufficient permissions' };
		}

		const result = await customFetch<ApiSuccess<null> | ApiError>(apiUrl(`/admin/reports/${reportId}/resolve`), {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({ status: status satisfies ContentReportStatus, resolutionNote }),
		});

		if (result.response.status === 403) {
			return { error: 'Insufficient permissions' };
		}
		if (!result.ok) {
			return { error: 'Failed to resolve report' };
		}

		GetContentReports({ status: 'Open' }).refresh();
		return { error: null };
	}
);

export type { ContentReportTargetType };
