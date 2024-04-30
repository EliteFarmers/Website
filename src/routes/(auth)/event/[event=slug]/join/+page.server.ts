import { error, redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GetAccount, GetEventDetails, JoinEvent, LeaveEvent } from '$lib/api/elite';

export const load = (async ({ locals, parent, params }) => {
	const { user } = await parent();
	const { discord_access_token: token } = locals;
	const { event: eventRoute } = params;

	// Remove everything before the last dash
	const eventId = eventRoute.slice(eventRoute.lastIndexOf('-') + 1);

	const { data: event } = await GetEventDetails(eventId).catch(() => ({ data: undefined }));

	if (!event?.id || !event.name || !event.guildId || !event.startTime || !event.endTime) {
		throw error(404, 'Event not found');
	}

	if (!token || !user) {
		throw redirect(302, '/login');
	}

	if (+event.endTime <= Date.now() / 1000) {
		// throw error(403, 'Event has already ended.');
	}

	const selectedAccount = user.minecraftAccounts?.find((a) => a.primaryAccount);

	if (!selectedAccount?.id) {
		return {
			user,
		};
	}

	const { data: account } = await GetAccount(selectedAccount.id).catch(() => ({ data: undefined }));

	return {
		user,
		account,
		event,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	join: async ({ locals, params, request }) => {
		const { discord_access_token: token, user } = locals;
		const { event: eventParam } = params;

		const eventId = eventParam?.slice(eventParam.lastIndexOf('-') + 1);

		if (!token || !user) {
			throw redirect(302, '/login');
		}

		if (!eventId) {
			return fail(404, { error: 'Event not found' });
		}

		const { data: event } = await GetEventDetails(eventId).catch(() => ({ data: undefined }));

		if (!event?.id || !event.name || !event.guildId || !event.startTime || !event.endTime) {
			return fail(404, { error: 'Event not found' });
		}

		if (+event.endTime <= Date.now() / 1000) {
			return fail(403, { error: 'Event has already ended.' });
		}

		const data = await request.formData();
		const uuid = (data.get('account') as string) || undefined;
		const profile = (data.get('profile') as string) || undefined;

		const { response } = await JoinEvent(eventId, token, uuid, profile);

		if (response.status !== 200) {
			const text = await response.text();
			return fail(response.status, { error: text || 'Unknown error' });
		}

		throw redirect(302, `/event/${eventParam}`);
	},
	leave: async ({ locals, params }) => {
		const { discord_access_token: token, user } = locals;
		const { event: eventParam } = params;

		const eventId = eventParam?.slice(eventParam.lastIndexOf('-') + 1);

		if (!token || !user) {
			throw redirect(302, '/login');
		}

		if (!eventId) {
			return fail(404, { error: 'Event not found' });
		}

		const { data: event } = await GetEventDetails(eventId).catch(() => ({ data: undefined }));

		if (!event?.id || !event.name || !event.guildId || !event.startTime || !event.endTime) {
			return fail(404, { error: 'Event not found' });
		}

		if (+event.endTime <= Date.now() / 1000) {
			return fail(403, { error: 'Event has already ended.' });
		}

		const { response } = await LeaveEvent(eventId, token);

		if (response.status !== 200) {
			const text = await response.text();
			return fail(response.status, { error: text || 'Unknown error' });
		}

		throw redirect(302, `/event/${eventParam}`);
	},
};
