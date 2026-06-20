import { command, query } from '$app/server';
import {
	deleteNotificationPushSubscription,
	getNotificationPreferences,
	getNotificationPushPublicKey,
	getNotifications,
	markNotificationRead,
	updateNotificationPreferences,
	upsertNotificationPushSubscription,
	zodGetNotificationsQueryParams,
	zodUpdateNotificationPreferencesBody,
	zodUpsertNotificationPushSubscriptionBody,
	type NotificationPreferenceDto,
} from '$lib/api';
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

const preferenceListSchema = zodUpdateNotificationPreferencesBody.shape.preferences;

export type NotificationPreference = NotificationPreferenceDto;

export const GetNotificationPreferences = query(async () => {
	const { data } = await getNotificationPreferences();
	return data;
});

export const UpdateNotificationPreferences = command(preferenceListSchema, async (preferences) => {
	const { response, error } = await updateNotificationPreferences({ preferences });
	return { ok: response.ok, error };
});

export const GetNotificationPushPublicKey = query(async () => {
	const { data } = await getNotificationPushPublicKey();
	return data;
});

export const UpsertNotificationPushSubscription = command(
	zodUpsertNotificationPushSubscriptionBody,
	async (subscription) => {
		const { data, response, error } = await upsertNotificationPushSubscription(subscription);
		return { data, ok: response.ok, error };
	}
);

export const DeleteNotificationPushSubscription = command(z.number(), async (subscriptionId) => {
	const { response, error } = await deleteNotificationPushSubscription(subscriptionId.toString());
	return { ok: response.ok, error };
});
