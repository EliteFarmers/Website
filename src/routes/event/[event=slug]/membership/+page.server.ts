import { error, redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	CreateEventTeam,
	GetAccount,
	GetEventDetails,
	GetEventTeam,
	GetEventTeamWords,
	GetEventTeams,
	JoinEvent,
	JoinEventTeam,
	KickEventTeamMember,
	LeaveEvent,
	LeaveEventTeam,
	RegenerateEventTeamCode,
	UpdateEventTeam,
} from '$lib/api/elite';

export const load = (async ({ locals, parent, params }) => {
	const { session, self: member } = await parent();
	const { access_token: token } = locals;
	const { event: eventRoute } = params;

	// Remove everything before the last dash
	const eventId = eventRoute.slice(eventRoute.lastIndexOf('-') + 1);

	const { data: event } = await GetEventDetails(eventId).catch(() => ({ data: undefined }));

	if (!event?.id || !event.name || !event.guildId || !event.startTime || !event.endTime) {
		throw error(404, 'Event not found');
	}

	if (!token || !session) {
		throw redirect(307, '/login?redirect=' + encodeURIComponent(`/event/${eventRoute}`));
	}

	const { data: account } = session.uuid
		? await GetAccount(session.uuid).catch(() => ({ data: undefined }))
		: { data: undefined };

	if (event.maxTeamMembers !== 0 || event.maxTeams !== 0) {
		const { data: teams } = await GetEventTeams(eventId).catch(() => ({ data: undefined }));
		const { data: words } = await GetEventTeamWords().catch(() => ({ data: undefined }));

		if (member?.teamId && token) {
			const { data: team } = await GetEventTeam(token, eventId, member.teamId).catch(() => ({ data: undefined }));

			return {
				account,
				member,
				teams,
				event,
				words,
				team,
			};
		}

		return {
			account,
			member,
			teams,
			event,
			words,
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
			throw redirect(307, '/login');
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

		return { success: true };
	},
	joinTeam: async ({ locals, params, request }) => {
		const { access_token: token, session } = locals;
		const { event: eventParam } = params;

		const eventId = eventParam?.slice(eventParam.lastIndexOf('-') + 1);

		if (!token || !session) {
			throw redirect(307, '/login');
		}

		if (!eventId) {
			return fail(404, { error: 'Event not found' });
		}

		const data = await request.formData();
		const teamId = (data.get('team') as string) || undefined;
		const code = (data.get('code') as string) || undefined;

		if (!code || !teamId) {
			return fail(400, { error: 'Invalid request' });
		}

		const { response: codeResponse } = await JoinEventTeam(token, eventId, teamId, code.trim().toUpperCase());

		if (codeResponse.status !== 200) {
			const text = await codeResponse.text();
			return fail(codeResponse.status, { error: text || 'Unknown error' });
		}

		return { success: true };
	},
	createTeam: async ({ locals, params, request }) => {
		const { access_token: token, session } = locals;
		const { event: eventParam } = params;

		const eventId = eventParam?.slice(eventParam.lastIndexOf('-') + 1);

		if (!token || !session) {
			throw redirect(307, '/login');
		}

		if (!eventId) {
			return fail(404, { error: 'Event not found' });
		}

		const data = await request.formData();
		const teamName = (data.get('name') as string) || undefined;

		if (!teamName) {
			return fail(400, { error: 'Invalid request' });
		}

		const { response: codeResponse } = await CreateEventTeam(token, eventId, {
			name: teamName
				.split(' ')
				.filter((w) => w)
				.map((w) => w.replace('_', ' ')),
		});

		if (codeResponse.status !== 200) {
			const text = await codeResponse.text();
			return fail(codeResponse.status, { error: text || 'Unknown error' });
		}

		return { success: true };
	},
	updateTeam: async ({ locals, params, request }) => {
		const { access_token: token, session } = locals;
		const { event: eventParam } = params;

		const eventId = eventParam?.slice(eventParam.lastIndexOf('-') + 1);

		if (!token || !session) {
			throw redirect(307, '/login');
		}

		if (!eventId) {
			return fail(404, { error: 'Event not found' });
		}

		const data = await request.formData();
		const teamId = (data.get('team') as string) || undefined;
		const teamName = (data.get('name') as string) || undefined;

		if (!teamName || !teamId) {
			return fail(400, { error: 'Invalid request' });
		}

		const { response: codeResponse } = await UpdateEventTeam(token, eventId, teamId, {
			name: teamName
				.split(' ')
				.filter((w) => w)
				.map((w) => w.replace('_', ' ')),
		});

		if (codeResponse.status !== 200) {
			const text = await codeResponse.text();
			return fail(codeResponse.status, { error: text || 'Unknown error' });
		}

		return { success: true };
	},
	newCode: async ({ locals, params, request }) => {
		const { access_token: token, session } = locals;
		const { event: eventParam } = params;

		const eventId = eventParam?.slice(eventParam.lastIndexOf('-') + 1);

		if (!token || !session) {
			throw redirect(307, '/login');
		}

		if (!eventId) {
			return fail(404, { error: 'Event not found' });
		}

		const data = await request.formData();
		const teamId = (data.get('team') as string) || undefined;

		if (!teamId) {
			return fail(400, { error: 'Invalid request' });
		}

		const { response: codeResponse } = await RegenerateEventTeamCode(token, eventId, teamId);

		if (codeResponse.status !== 200) {
			const text = await codeResponse.text();
			return fail(codeResponse.status, { error: text || 'Unknown error' });
		}

		return { success: true };
	},
	leave: async ({ locals, params }) => {
		const { access_token: token, session } = locals;
		const { event: eventParam } = params;

		const eventId = eventParam?.slice(eventParam.lastIndexOf('-') + 1);

		if (!token || !session) {
			throw redirect(307, '/login');
		}

		if (!eventId) {
			return fail(404, { error: 'Event not found' });
		}

		const { response } = await LeaveEvent(eventId, token);

		if (response.status !== 200) {
			const text = await response.text();
			return fail(response.status, { error: text || 'Unknown error' });
		}

		throw redirect(307, `/event/${eventParam}`);
	},
	leaveTeam: async ({ locals, params, request }) => {
		const { access_token: token, session } = locals;
		const { event: eventParam } = params;

		const eventId = eventParam?.slice(eventParam.lastIndexOf('-') + 1);

		if (!token || !session) {
			throw redirect(307, '/login');
		}

		if (!eventId) {
			return fail(404, { error: 'Event not found' });
		}

		const data = await request.formData();
		const teamId = (data.get('team') as string) || undefined;

		if (!teamId) {
			return fail(400, { error: 'Invalid request' });
		}

		const { response: codeResponse } = await LeaveEventTeam(token, eventId, teamId);

		if (codeResponse.status !== 200) {
			const text = await codeResponse.text();
			return fail(codeResponse.status, { error: text || 'Unknown error' });
		}

		return { success: true };
	},
	kickMember: async ({ locals, params, request }) => {
		const { access_token: token, session } = locals;
		const { event: eventParam } = params;

		const eventId = eventParam?.slice(eventParam.lastIndexOf('-') + 1);

		if (!token || !session) {
			throw redirect(307, '/login');
		}

		if (!eventId) {
			return fail(404, { error: 'Event not found' });
		}

		const data = await request.formData();
		const teamId = (data.get('team') as string) || undefined;
		const memberUuid = (data.get('member') as string) || undefined;

		if (!teamId || !memberUuid) {
			return fail(400, { error: 'Invalid request' });
		}

		const { response: codeResponse } = await KickEventTeamMember(token, {
			eventId,
			teamId,
			playerUuid: memberUuid,
		});

		if (codeResponse.status !== 200) {
			const text = await codeResponse.text();
			return fail(codeResponse.status, { error: text || 'Unknown error' });
		}

		return { success: true };
	},
};
