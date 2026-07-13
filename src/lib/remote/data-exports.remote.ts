import { command, query } from '$app/server';
import {
	getDataExport,
	getDataExportDownloadUrl,
	getLatestDataExport,
	requestDataExport,
	zodGetDataExportDownloadUrlParams,
	zodGetDataExportParams,
} from '$lib/api';

export const GetLatestDataExport = query(async () => {
	const { ok, data } = await getLatestDataExport();
	if (!ok) return null;
	return data;
});

export const GetDataExport = query(zodGetDataExportParams, async ({ id }) => {
	const { ok, data } = await getDataExport(id);
	if (!ok) return null;
	return data;
});

export const GetDataExportDownloadUrl = query(zodGetDataExportDownloadUrlParams, async ({ id }) => {
	const { ok, data } = await getDataExportDownloadUrl(id);
	if (!ok) return null;
	return data;
});

export const PollDataExportStatus = command(zodGetDataExportParams, async ({ id }) => {
	const { ok, data } = await getDataExport(id);
	if (!ok) return null;
	return data;
});

export const RequestDataExport = command(async () => {
	const { ok, data, error } = await requestDataExport();
	if (!ok) return { success: false as const, error };
	return { success: true as const, data };
});
