import { error, fail, type NumericRange } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { CanManageGuild, EventType } from '$lib/utils';
import {
	GetGuild,
	GetGuildEvents,
	CreateWeightEvent,
	EditEvent,
	BanEventMember,
	UnbanEventMember,
	GetEventMembers,
	GetEventBans,
	CreateMedalEvent,
} from '$lib/api/elite';
import type { components } from '$lib/api/api';

export const load: PageServerLoad = async ({ parent, locals }) => {
	const { guild, userPermissions, session } = await parent();
	const { access_token: token } = locals;

	const hasPerms = CanManageGuild(userPermissions, session);

	if (!hasPerms || !token) {
		throw error(403, 'You do not have permission to edit this guild.');
	}

	if (!guild?.features?.eventsEnabled || !guild?.id) {
		throw error(402, 'This guild does not have the Events feature enabled.');
	}

	const { data: events } = await GetGuildEvents(guild.id).catch(() => ({ data: undefined }));

	const details: {
		eventId: string;
		event: components['schemas']['EventDetailsDto'];
		members: components['schemas']['EventMemberDto'][];
		bans: components['schemas']['EventMemberBannedDto'][];
	}[] = [];

	for (const event of events ?? []) {
		if (!event.id || !event.guildId) continue;

		const { data: members } = await GetEventMembers(event.id).catch(() => ({ data: undefined }));
		const { data: bans } = await GetEventBans(token, event.guildId, event.id).catch(() => ({ data: undefined }));

		details.push({
			eventId: event.id,
			event,
			members: members ?? [],
			bans: bans ?? [],
		});
	}

	return {
		...(guild.features.eventSettings ?? {}),
		events: details,
	};
};

export const actions: Actions = {
	create: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		// Check if guild exists and if user has perms
		await getGuild(guildId, token, locals.session);

		const data = await request.formData();

		const type = data.get('type') as EventType;
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const rules = data.get('rules') as string;
		const prizes = data.get('prizes') as string;
		const startDate = data.get('startDate') as string;
		const endDate = data.get('endDate') as string;
		const joinDate = data.get('joinDate') as string;
		const maxTeamSize = data.get('maxTeamSize') as string | undefined;

		if (!type) throw error(400, 'Missing required field: type');
		if (!title) throw error(400, 'Missing required field: title');
		if (!description) throw error(400, 'Missing required field: description');
		if (!rules) throw error(400, 'Missing required field: rules');
		if (!prizes) throw error(400, 'Missing required field: prizes');
		if (maxTeamSize && isNaN(parseInt(maxTeamSize))) throw error(400, 'Invalid field: maxTeamSize');

		const startTime = startDate ? (new Date(startDate + '+00:00').getTime() / 1000).toString() : undefined;
		const endTime = endDate ? (new Date(endDate + '+00:00').getTime() / 1000).toString() : undefined;
		const joinUntilTime = joinDate ? (new Date(joinDate + '+00:00').getTime() / 1000).toString() : undefined;

		if (!startTime) throw error(400, 'Missing required field: startDate');
		if (!endTime) throw error(400, 'Missing required field: endDate');

		const body = {
			name: title,
			rules,
			description,
			prizeInfo: prizes,
			startTime: startTime as unknown as number, // These are parsed into numbers in the API
			endTime: endTime as unknown as number,
			joinTime: joinUntilTime as unknown as number,
			guildId: guildId,
			maxTeamMembers: maxTeamSize ? parseInt(maxTeamSize) : undefined,
		} satisfies components['schemas']['CreateWeightEventDto'] | components['schemas']['CreateMedalEventDto'];

		const method = type === EventType.Medals ? CreateMedalEvent : CreateWeightEvent;

		const { response } = await method(token, body).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (response.status !== 200) {
			const msg = await response.text();
			throw error(response.status as NumericRange<400, 499>, msg);
		}

		return {
			success: true,
		};
	},
	edit: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		// Check if guild exists and if user has perms
		await getGuild(guildId, token, locals.session);
		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const title = (data.get('title') as string) || undefined;
		const description = (data.get('description') as string) || undefined;
		const rules = (data.get('rules') as string) || undefined;
		const prizes = (data.get('prizes') as string) || undefined;
		const startDate = (data.get('startDate') as string) || undefined;
		const endDate = (data.get('endDate') as string) || undefined;
		const joinDate = (data.get('joinDate') as string) || undefined;

		const startTime = startDate ? (new Date(startDate + '+00:00').getTime() / 1000).toString() : undefined;
		const endTime = endDate ? (new Date(endDate + '+00:00').getTime() / 1000).toString() : undefined;
		const joinUntilTime = joinDate ? (new Date(joinDate + '+00:00').getTime() / 1000).toString() : undefined;

		const body: components['schemas']['EditEventDto'] = {
			name: title,
			rules,
			description,
			prizeInfo: prizes,
			startTime: startTime as unknown as number, // These are parsed into numbers in the API
			endTime: endTime as unknown as number,
			joinTime: joinUntilTime as unknown as number,
			guildId: guildId,
		};

		const { response } = await EditEvent(token, eventId, body).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (response.status !== 200) {
			const msg = await response.text();
			throw error(response.status as NumericRange<400, 499>, msg);
		}

		return {
			success: true,
		};
	},
	banmember: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		await getGuild(guildId, token, locals.session);
		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const uuid = data.get('uuid') as string;
		const reason = (data.get('reason') as string) || 'No reason provided';

		if (!uuid) return fail(400, { error: 'Missing required field: uuid' });

		const { response } = await BanEventMember(token, eventId, uuid, reason).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (response.status !== 200) {
			const msg = await response.text();
			return fail(response.status, { error: msg });
		}

		return {
			success: true,
		};
	},
	unbanmember: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		await getGuild(guildId, token, locals.session);
		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const uuid = data.get('uuid') as string;
		if (!uuid) return fail(400, { error: 'Missing required field: uuid' });

		await UnbanEventMember(token, guildId, eventId, uuid).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		return {
			success: true,
		};
	},
};

async function getGuild(guildId: string, token: string, session?: App.Locals['session']) {
	const guild = await GetGuild(guildId, token)
		.then((guild) => guild.data ?? undefined)
		.catch(() => undefined);

	if (!guild) throw error(404, 'Guild not found');

	const hasPerms = CanManageGuild(guild.permissions, session);
	if (!hasPerms) throw error(403, 'You do not have permission to edit this guild.');

	if (!guild.guild?.features?.eventsEnabled) {
		throw error(402, 'This guild does not have the Events feature enabled.');
	}

	return guild;
}
