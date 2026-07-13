import { query } from '$app/server';
import {
	getOrderStatus,
	getUserOrderDetail,
	getUserOrders,
	zodGetOrderStatusParams,
	zodGetUserOrderDetailParams,
	zodGetUserOrdersQueryParams,
} from '$lib/api';
import { error } from '@sveltejs/kit';

export const GetUserOrdersList = query(zodGetUserOrdersQueryParams, async (params) => {
	const { response, data, error: problem } = await getUserOrders(params);

	if (!response.ok || !data) {
		error(response.status, problem ?? 'Failed to fetch payments');
	}

	return data;
});

export const GetUserOrder = query(zodGetUserOrderDetailParams, async ({ orderId }) => {
	const { response, data, error: problem } = await getUserOrderDetail(orderId);

	if (!response.ok || !data) {
		error(response.status, problem ?? 'Failed to fetch payment details');
	}

	return data;
});

export const GetOrderStatus = query(zodGetOrderStatusParams, async ({ orderId }) => {
	const { response, data, error: problem } = await getOrderStatus(orderId);

	if (!response.ok || !data) {
		error(response.status, problem ?? 'Failed to fetch order status');
	}

	return data;
});
