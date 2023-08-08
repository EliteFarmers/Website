import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { CanManageGuild } from '$lib/utils';
import {
	GetGuild,
	GetGuildEvents,
	CreateEvent,
	EditEvent,
	BanEventMember,
	UnbanEventMember,
	GetEventMembers,
	GetEventBans
} from '$lib/api/elite';
import type { components } from '$lib/api/api';

export const load: PageServerLoad = async ({ parent, locals }) => {
	const { userPermissions, guild } = await parent();
	const { discord_access_token: token } = locals;

	const hasPerms = CanManageGuild(userPermissions);

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
		if (!event.id) continue;

		const { data: members } = await GetEventMembers(event.id).catch(() => ({ data: undefined }));
		const { data: bans } = await GetEventBans(token, event.id).catch(() => ({ data: undefined }));

		details.push({
			eventId: event.id,
			event,
			members: members ?? [],
			bans: bans ?? [],
		});
	}

	return {
		...guild.features.eventSettings,
		events: details,
	};
};

export const actions: Actions = {
	create: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { discord_access_token: token } = locals;

		if (!locals.user || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		// Check if guild exists and if user has perms
		await getGuild(guildId, token);

		const data = await request.formData();

		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const rules = data.get('rules') as string;
		const prizes = data.get('prizes') as string;
		const startDate = data.get('startDate') as string;
		const endDate = data.get('endDate') as string;

		if (!title) throw error(400, 'Missing required field: title');
		if (!description) throw error(400, 'Missing required field: description');
		if (!rules) throw error(400, 'Missing required field: rules');
		if (!prizes) throw error(400, 'Missing required field: prizes');

		const startTime = startDate ? (new Date(startDate).getTime() / 1000).toString() : undefined;
		const endTime = endDate ? (new Date(endDate).getTime() / 1000).toString() : undefined;

		if (!startTime) throw error(400, 'Missing required field: startDate');
		if (!endTime) throw error(400, 'Missing required field: endDate');

		const body = {
			name: title,
			rules,
			description,
			prizeInfo: prizes,
			startTime,
			endTime,
			guildId: guildId,
		}

		const { response } = await CreateEvent(token, body).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (response.status !== 200) {
			const msg = await response.text();
			throw error(response.status, msg);
		}

		return {
			success: true,
		};
	},
	edit: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { discord_access_token: token } = locals;

		if (!locals.user || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		// Check if guild exists and if user has perms
		await getGuild(guildId, token);
		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const rules = data.get('rules') as string;
		const prizes = data.get('prizes') as string;
		const startDate = data.get('startDate') as string;
		const endDate = data.get('endDate') as string;

		const startTime = startDate ? (new Date(startDate).getTime() / 1000).toString() : undefined;
		const endTime = endDate ? (new Date(endDate).getTime() / 1000).toString() : undefined;

		const body = {
			name: title,
			rules,
			description,
			prizeInfo: prizes,
			startTime,
			endTime,
			guildId: guildId,
		}

		const { response } = await EditEvent(token, eventId, body).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (response.status !== 200) {
			const msg = await response.text();
			throw error(response.status, msg);
		}

		return {
			success: true,
		};
	},
	banmember: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { discord_access_token: token } = locals;

		if (!locals.user || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		await getGuild(guildId, token);
		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const uuid = data.get('uuid') as string;
		const reason = data.get('reason') as string || 'No reason provided';

		if (!uuid) return fail(400, { error: 'Missing required field: uuid' });

		await BanEventMember(token, eventId, uuid, reason).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		return {
			success: true,
		};
	},
	unbanmember: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { discord_access_token: token } = locals;

		if (!locals.user || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		await getGuild(guildId, token);
		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const uuid = data.get('uuid') as string;
		if (!uuid) return fail(400, { error: 'Missing required field: uuid' });

		await UnbanEventMember(token, eventId, uuid).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		return {
			success: true,
		};
	},
};

async function getGuild(guildId: string, token: string) {
	const guild = await GetGuild(guildId, token)
		.then((guild) => guild.data ?? undefined)
		.catch(() => undefined);

	if (!guild) throw error(404, 'Guild not found');

	const hasPerms = CanManageGuild(guild.permissions);
	if (!hasPerms) throw error(403, 'You do not have permission to edit this guild.');

	if (!guild.guild?.features?.eventsEnabled) {
		throw error(402, 'This guild does not have the Events feature enabled.');
	}

	return guild;
}
