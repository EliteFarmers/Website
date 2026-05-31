import { command, getRequestEvent, query } from '$app/server';
import { createContentReport, listContentReports, resolveContentReport } from '$lib/api';
import { ContentReportStatus, ContentReportTargetType } from '$lib/api/schemas';
import type { ContentReportStatus as ContentReportStatusValue } from '$lib/api/schemas';
import { error } from '@sveltejs/kit';
import * as z from 'zod';

export const createContentReportCommand = command(
	z.object({
		targetType: z.enum([ContentReportTargetType.guide, ContentReportTargetType.comment]),
		targetId: z.number(),
		reason: z.string().min(1).max(1000),
	}),
	async ({ targetType, targetId, reason }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token) {
			return { error: 'Unauthorized' };
		}

		const result = await createContentReport({ targetType, targetId, reason });

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
			status: z
				.enum([ContentReportStatus.open, ContentReportStatus.reviewed, ContentReportStatus.dismissed])
				.nullable()
				.optional(),
		})
		.optional(),
	async (params) => {
		const event = getRequestEvent();
		if (!event.locals.access_token || !event.locals.session?.perms.support) {
			error(403, 'Insufficient permissions');
		}

		const status = params?.status ?? ContentReportStatus.open;
		const result = await listContentReports({ status });

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
		status: z.enum([ContentReportStatus.reviewed, ContentReportStatus.dismissed]),
		resolutionNote: z.string().max(1000).nullable().optional(),
	}),
	async ({ reportId, status, resolutionNote }) => {
		const event = getRequestEvent();
		if (!event.locals.access_token || !event.locals.session?.perms.support) {
			return { error: 'Insufficient permissions' };
		}

		const result = await resolveContentReport(reportId, {
			status: status satisfies ContentReportStatusValue,
			resolutionNote,
		});

		if (result.response.status === 403) {
			return { error: 'Insufficient permissions' };
		}
		if (!result.ok) {
			return { error: 'Failed to resolve report' };
		}

		GetContentReports({ status: ContentReportStatus.open }).refresh();
		return { error: null };
	}
);

export type { ContentReportStatus, ContentReportTargetType } from '$lib/api/schemas';
