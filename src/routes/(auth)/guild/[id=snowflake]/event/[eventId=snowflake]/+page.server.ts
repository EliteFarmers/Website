import { CanManageGuild } from '$lib/utils';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	BanEventMember,
	EditEvent,
	GetAdminEventMembers,
	GetEventBans,
	GetAdminEventDetails,
	UnbanEventMember,
	SetEventBanner,
	ClearEventBanner,
	GetEventDefaults,
	ForceAddEventMember,
	PermDeleteEventMember,
} from '$lib/api/elite';
import type { components } from '$lib/api/api';

export const load = (async ({ parent, params, locals }) => {
	const { guild, authGuild, session } = await parent();
	const { access_token: token } = locals;
	const { eventId } = params;

	const hasPerms = CanManageGuild(authGuild, session);

	if (!hasPerms || !token) {
		throw error(403, 'You do not have permission to edit this guild.');
	}

	const { data: event } = await GetAdminEventDetails(token, guild.id, eventId).catch(() => ({ data: undefined }));

	if (!event || event.guildId !== guild.id) {
		throw error(404, 'Event not found');
	}

	const members = GetAdminEventMembers(token, event.guildId, event.id)
		.then((r) => r.data)
		.catch(() => undefined);
	const bans = GetEventBans(token, event.guildId, event.id)
		.then((r) => r.data)
		.catch(() => undefined);
	const defaults = GetEventDefaults()
		.then((r) => r.data)
		.catch(() => undefined);

	return {
		event,
		members: members,
		bans: bans,
		defaults,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	edit: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

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
			return fail(response.status, { error: msg });
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

		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const uuid = data.get('uuid') as string;
		const reason = (data.get('reason') as string) || 'No reason provided';

		if (!uuid) return fail(400, { error: 'Missing required field: uuid' });

		const { response } = await BanEventMember(token, guildId, eventId, uuid, reason).catch((e) => {
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

		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const uuid = data.get('uuid') as string;
		if (!uuid) return fail(400, { error: 'Missing required field: uuid' });

		await UnbanEventMember(token, guildId, eventId, uuid).catch((e) => {
			console.log(e);
			return fail(500, { error: 'Internal Server Error' });
		});

		return {
			success: true,
		};
	},
	banner: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const image = (data.get('image') as string) || undefined;
		if (!image) return fail(400, { error: 'Missing required field: banner' });

		const { response } = await SetEventBanner(token, eventId, guildId, image).catch((e) => {
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
	clearbanner: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const { response } = await ClearEventBanner(token, eventId, guildId).catch((e) => {
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
	editCropWeights: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const body: components['schemas']['EditEventDto'] = {
			guildId: guildId,
			weightData: {
				cropWeights: {
					Cactus: +(data.get('Cactus') as string),
					Carrot: +(data.get('Carrot') as string),
					CocoaBeans: +(data.get('CocoaBeans') as string),
					Melon: +(data.get('Melon') as string),
					Mushroom: +(data.get('Mushroom') as string),
					NetherWart: +(data.get('NetherWart') as string),
					Potato: +(data.get('Potato') as string),
					Pumpkin: +(data.get('Pumpkin') as string),
					SugarCane: +(data.get('SugarCane') as string),
					Wheat: +(data.get('Wheat') as string),
				},
			},
		};

		const { response } = await EditEvent(token, eventId, body).catch((e) => {
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
	editMedalWeights: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const body: components['schemas']['EditEventDto'] = {
			guildId: guildId,
			medalData: {
				medalWeights: {
					Bronze: +(data.get('bronze') as string),
					Silver: +(data.get('silver') as string),
					Gold: +(data.get('gold') as string),
					Platinum: +(data.get('platinum') as string),
					Diamond: +(data.get('diamond') as string),
				},
			},
		};

		const { response } = await EditEvent(token, eventId, body).catch((e) => {
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
	forceAddMember: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const uuid = data.get('uuid') as string;
		if (!uuid) return fail(400, { error: 'Missing required field: uuid' });

		const profile = data.get('profile') as string;
		if (!profile) return fail(400, { error: 'Missing required field: profile' });

		const { response, error: e } = await ForceAddEventMember(token, guildId, eventId, uuid, profile).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok || e) {
			return fail(response.status, { error: e });
		}

		return {
			success: true,
		};
	},
	permDeleteMember: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const uuid = data.get('uuid') as string;
		if (!uuid) return fail(400, { error: 'Missing required field: uuid' });

		const { response, error: e } = await PermDeleteEventMember(token, guildId, eventId, uuid).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok || e) {
			return fail(response.status, { error: e });
		}

		return {
			success: true,
		};
	},
};
