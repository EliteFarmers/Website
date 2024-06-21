import { error, redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	GetAccount,
	GetEventDetails,
	GetEventMember,
	GetEventTeams,
	JoinEvent,
	JoinEventTeam,
	LeaveEvent,
} from '$lib/api/elite';

export const load = (async ({ locals, parent, params }) => {
	const { session } = await parent();
	const { access_token: token } = locals;
	const { event: eventRoute } = params;

	// Remove everything before the last dash
	const eventId = eventRoute.slice(eventRoute.lastIndexOf('-') + 1);

	const { data: event } = await GetEventDetails(eventId).catch(() => ({ data: undefined }));

	if (!event?.id || !event.name || !event.guildId || !event.startTime || !event.endTime) {
		throw error(404, 'Event not found');
	}

	if (!token || !session?.uuid) {
		throw redirect(302, '/login');
	}

	const { data: account } = await GetAccount(session.uuid).catch(() => ({ data: undefined }));
	const { data: member } = await GetEventMember(eventId, session.uuid).catch(() => ({ data: undefined }));

	if (event.maxTeamMembers !== 0 || event.maxTeams !== 0) {
		const { data: teams } = await GetEventTeams(eventId).catch(() => ({ data: undefined }));

		return {
			account,
			member,
			teams,
			event,
		};
	}

	return {
		account,
		member,
		event,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	join: async ({ locals, params, request }) => {
		const { access_token: token, session } = locals;
		const { event: eventParam } = params;

		const eventId = eventParam?.slice(eventParam.lastIndexOf('-') + 1);

		if (!token || !session) {
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
		const teamId = (data.get('team') as string) || undefined;
		const code = (data.get('code') as string) || undefined;

		const { response } = await JoinEvent(eventId, token, uuid, profile);

		if (response.status !== 200) {
			const text = await response.text();
			return fail(response.status, { error: text || 'Unknown error' });
		}

		if (code && teamId) {
			const { response: codeResponse } = await JoinEventTeam(token, eventId, teamId, code);

			if (codeResponse.status !== 200) {
				const text = await codeResponse.text();
				return fail(codeResponse.status, { error: text || 'Unknown error' });
			}
		}

		throw redirect(302, `/event/${eventParam}`);
	},
	leave: async ({ locals, params }) => {
		const { access_token: token, session } = locals;
		const { event: eventParam } = params;

		const eventId = eventParam?.slice(eventParam.lastIndexOf('-') + 1);

		if (!token || !session) {
			throw redirect(302, '/login');
		}

		if (!eventId) {
			return fail(404, { error: 'Event not found' });
		}

		const { response } = await LeaveEvent(eventId, token);

		if (response.status !== 200) {
			const text = await response.text();
			return fail(response.status, { error: text || 'Unknown error' });
		}

		throw redirect(302, `/event/${eventParam}`);
	},
};
