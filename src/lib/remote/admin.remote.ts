import { query } from '$app/server';
import { getAuditLogFilters, getAuditLogs, zodGetAuditLogsQueryParams } from '$lib/api';

export const GetAuditLogs = query(zodGetAuditLogsQueryParams, async (filters) => {
	const result = await getAuditLogs(filters as Parameters<typeof getAuditLogs>[0]);
	return result.data;
});

export const GetAuditLogFilters = query(async () => {
	const result = await getAuditLogFilters();
	return result.data;
});
