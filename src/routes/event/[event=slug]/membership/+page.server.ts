import { error, redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	CreateEventTeam,
	GetAccount,
	GetEventDetails,
	GetEventTeam,
	GetEventTeams,
	JoinEvent,
	JoinEventTeam,
	KickEventTeamMember,
	LeaveEvent,
	LeaveEventTeam,
	RegenerateEventTeamCode,
	TransferEventTeamOwnership,
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

		if (member?.teamId && token) {
			const { data: team } = await GetEventTeam(token, eventId, member.teamId).catch(() => ({ data: undefined }));

			return {
				account,
				member,
				teams,
				event,
				words: locals.cache?.teamwords,
				team,
			};
		}

		return {
			account,
			member,
			teams,
			event,
			words: locals.cache?.teamwords,
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

		const { response, error: problem } = await JoinEvent(eventId, token, uuid, profile);

		if (!response.ok || problem) {
			return fail(response.status, { error: problem?.message || 'Unknown error', problem });
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

		const { response: codeResponse, error: problem } = await JoinEventTeam(
			token,
			eventId,
			teamId,
			code.trim().toUpperCase()
		);

		if (!codeResponse.ok) {
			return fail(codeResponse.status, { error: 'Failed to join team', problem });
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
		const teamName = data.get('name') as string;

		if (!teamName) {
			return fail(400, { error: 'Invalid request' });
		}

		const { response: codeResponse, error: problem } = await CreateEventTeam(token, eventId, {
			name: teamName
				.split(' ')
				.filter((w) => w)
				.map((w) => w.replace('_', ' ')),
		});

		if (!codeResponse.ok) {
			return fail(codeResponse.status, { error: 'Failed to create team', problem });
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

		const { response: codeResponse, error: problem } = await UpdateEventTeam(token, eventId, teamId, {
			name: teamName
				.split(' ')
				.filter((w) => w)
				.map((w) => w.replace('_', ' ')),
		});

		if (!codeResponse.ok) {
			return fail(codeResponse.status, { error: 'Failed to update team', problem });
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

		const { response: codeResponse, error: problem } = await RegenerateEventTeamCode(token, eventId, teamId);

		if (!codeResponse.ok) {
			return fail(codeResponse.status, { error: 'Failed to change join code', problem });
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

		const { response, error: problem } = await LeaveEvent(eventId, token);

		if (!response.ok || problem) {
			return fail(response.status, { error: 'Failed to leave event', problem });
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

		const { response: codeResponse, error: problem } = await LeaveEventTeam(token, eventId, teamId);

		if (!codeResponse.ok) {
			return fail(codeResponse.status, { error: 'Failed to leave team', problem });
		}

		return { success: true };
	},
	transferOwnership: async ({ locals, params, request }) => {
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

		const { response: codeResponse, error: problem } = await TransferEventTeamOwnership(token, {
			eventId,
			teamId,
			playerUuid: memberUuid,
		});

		if (!codeResponse.ok) {
			return fail(codeResponse.status, { error: 'Failed to transfer team ownership!', problem });
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

		const { response: codeResponse, error: problem } = await KickEventTeamMember(token, {
			eventId,
			teamId,
			playerUuid: memberUuid,
		});

		if (!codeResponse.ok) {
			return fail(codeResponse.status, { error: 'Failed to kick team member', problem });
		}

		return { success: true };
	},
};
