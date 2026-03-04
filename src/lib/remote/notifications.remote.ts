import { command, query } from '$app/server';
import { getNotifications, markNotificationRead, zodGetNotificationsQueryParams } from '$lib/api';
import { mdToHtml } from '$lib/md';
import * as z from 'zod';

export const GetNotifications = query(zodGetNotificationsQueryParams, async (params) => {
	const { data } = await getNotifications(params);

	if (data?.notifications) {
		for (const notification of data.notifications) {
			if (!notification.message) continue;
			notification.message = await mdToHtml(notification.message);
		}
	}

	return data;
});

export const MarkNotificationRead = command(z.string(), async (notificationId: string) => {
	const { response } = await markNotificationRead(notificationId);
	return response.ok;
});
