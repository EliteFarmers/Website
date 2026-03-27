import { command, query } from '$app/server';
import {
	cancelRecurringPayment,
	getAdminOrderDetail,
	getAdminOrders,
	getAuditLogFilters,
	getAuditLogs,
	getOrderEvents,
	pauseRecurringPayment,
	reconcileOrder,
	refreshProviderState,
	refundOrder,
	replayWebhook,
	resolveRecipient,
	resumeRecurringPayment,
	zodCancelRecurringPaymentParams,
	zodGetAdminOrderDetailParams,
	zodGetAdminOrdersQueryParams,
	zodGetAuditLogsQueryParams,
	zodGetOrderEventsParams,
	zodPauseRecurringPaymentBody,
	zodPauseRecurringPaymentParams,
	zodReconcileOrderParams,
	zodRefreshProviderStateParams,
	zodRefundOrderParams,
	zodReplayWebhookParams,
	zodResolveRecipientBody,
	zodResolveRecipientParams,
	zodResumeRecurringPaymentParams,
} from '$lib/api';
import { error } from '@sveltejs/kit';

export const GetAuditLogs = query(zodGetAuditLogsQueryParams, async (filters) => {
	const result = await getAuditLogs(filters as Parameters<typeof getAuditLogs>[0]);
	return result.data;
});

export const GetAuditLogFilters = query(async () => {
	const result = await getAuditLogFilters();
	return result.data;
});

// --- Admin Orders ---

export const GetAdminOrders = query(zodGetAdminOrdersQueryParams, async (params) => {
	const { response, data, error: problem } = await getAdminOrders(params as Parameters<typeof getAdminOrders>[0]);

	if (!response.ok || !data) {
		error(response.status, problem ?? 'Failed to fetch orders');
	}

	return data;
});

export const GetAdminOrderDetail = query(zodGetAdminOrderDetailParams, async ({ orderId }) => {
	const { response, data, error: problem } = await getAdminOrderDetail(orderId);

	if (!response.ok || !data) {
		error(response.status, problem ?? 'Failed to fetch order detail');
	}

	return data;
});

export const GetOrderEvents = query(zodGetOrderEventsParams, async ({ orderId }) => {
	const { response, data, error: problem } = await getOrderEvents(orderId);

	if (!response.ok || !data) {
		error(response.status, problem ?? 'Failed to fetch order events');
	}

	return data;
});

// --- Admin Order Actions ---

export const ReconcileOrder = command(zodReconcileOrderParams, async ({ orderId }) => {
	const { response, data, error: problem } = await reconcileOrder(orderId);

	if (!response.ok || !data) {
		error(response.status, problem ?? 'Failed to reconcile order');
	}

	return data;
});

export const RefreshProviderState = command(zodRefreshProviderStateParams, async ({ orderId }) => {
	const { response, data, error: problem } = await refreshProviderState(orderId);

	if (!response.ok || !data) {
		error(response.status, problem ?? 'Failed to refresh provider state');
	}

	return data;
});

export const RefundOrder = command(zodRefundOrderParams, async ({ orderId }) => {
	const { response, data, error: problem } = await refundOrder(orderId);

	if (!response.ok || !data) {
		error(response.status, problem ?? 'Failed to refund order');
	}

	return data;
});

export const ResolveRecipient = command(
	zodResolveRecipientParams.extend(zodResolveRecipientBody.shape),
	async ({ orderId, ...body }) => {
		const { response, error: problem } = await resolveRecipient(orderId, body);

		if (!response.ok) {
			error(response.status, problem ?? 'Failed to resolve recipient');
		}

		return { success: true };
	}
);

export const ReplayWebhook = command(zodReplayWebhookParams, async ({ webhookId }) => {
	const { response, data, error: problem } = await replayWebhook(webhookId);

	if (!response.ok || !data) {
		error(response.status, problem ?? 'Failed to replay webhook');
	}

	return data;
});

// --- Recurring Payment Management ---

export const PauseRecurringPayment = command(
	zodPauseRecurringPaymentParams.merge(zodPauseRecurringPaymentBody),
	async ({ orderId, ...body }) => {
		const { response, data, error: problem } = await pauseRecurringPayment(orderId, body);

		if (!response.ok || !data) {
			error(response.status, problem ?? 'Failed to pause recurring payment');
		}

		return data;
	}
);

export const ResumeRecurringPayment = command(zodResumeRecurringPaymentParams, async ({ orderId }) => {
	const { response, data, error: problem } = await resumeRecurringPayment(orderId);

	if (!response.ok || !data) {
		error(response.status, problem ?? 'Failed to resume recurring payment');
	}

	return data;
});

export const CancelRecurringPayment = command(zodCancelRecurringPaymentParams, async ({ orderId }) => {
	const { response, data, error: problem } = await cancelRecurringPayment(orderId);

	if (!response.ok || !data) {
		error(response.status, problem ?? 'Failed to cancel recurring payment');
	}

	return data;
});
