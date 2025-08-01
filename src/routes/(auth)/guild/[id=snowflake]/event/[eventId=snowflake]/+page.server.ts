import type { components } from '$lib/api/api';
import {
	AddMemberToTeam,
	AdminCreateEventTeam,
	AdminDeleteTeam,
	AdminKickTeamMember,
	AdminTransferEventTeamOwnership,
	BanEventMember,
	ClearEventBanner,
	EditEvent,
	ForceAddEventMember,
	GetAdminEventDetails,
	GetAdminEventMembers,
	GetAdminEventTeams,
	GetEventBans,
	GetEventDefaults,
	PermDeleteEventMember,
	SetEventBanner,
	UnbanEventMember,
} from '$lib/api/elite';
import { CanManageGuild } from '$lib/utils';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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

	let teams = undefined;
	if (event.mode !== 'solo') {
		teams = GetAdminEventTeams(token, event.guildId, event.id)
			.then((r) => r.data)
			.catch(() => undefined);
	}

	const [membersData, bansData, defaultsData, teamsData] = await Promise.all([members, bans, defaults, teams]);

	return {
		event,
		members: membersData,
		bans: bansData,
		defaults: defaultsData,
		teams: teamsData,
		teamWords: locals.cache?.teamwords,
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

		const { response, error: e } = await EditEvent(token, eventId, guildId, body).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok || e) {
			return fail(response.status, { error: e || 'Failed to update event!' });
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

		const { response, error: e } = await BanEventMember(token, guildId, eventId, uuid, reason).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok || e) {
			return fail(response.status, { error: e || 'Failed to ban member!' });
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

		const { response, error: e } = await SetEventBanner(token, eventId, guildId, image).catch((e) => {
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
	clearbanner: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const { response, error: e } = await ClearEventBanner(token, eventId, guildId).catch((e) => {
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

		const { response, error: e } = await EditEvent(token, eventId, guildId, body).catch((e) => {
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

		const { response, error: e } = await EditEvent(token, eventId, guildId, body).catch((e) => {
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
	editPestWeights: async ({ locals, params, request }) => {
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
			pestData: {
				pestWeights: {
					Fly: +(data.get('Fly') as string),
					Rat: +(data.get('Rat') as string),
					Mite: +(data.get('Mite') as string),
					Moth: +(data.get('Moth') as string),
					Slug: +(data.get('Slug') as string),
					Mouse: +(data.get('Mouse') as string),
					Beetle: +(data.get('Beetle') as string),
					Locust: +(data.get('Locust') as string),
					Cricket: +(data.get('Cricket') as string),
					Mosquito: +(data.get('Mosquito') as string),
					Earthworm: +(data.get('Earthworm') as string),
				},
			},
		};

		const { response, error: e } = await EditEvent(token, eventId, guildId, body).catch((e) => {
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
	editCollectionWeights: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const eventId = data.get('id') as string;
		if (!eventId) throw error(400, 'Missing required field: id');

		const entries = Array.from(data.entries()).filter(([key]) => key.startsWith('collection.'));
		const weights = {} as Record<string, { name: string; weight: number }>;

		for (const [key, value] of entries) {
			const [, id, setting] = key.split('.');

			const coll = weights[id.trim()] ?? (weights[id.trim()] = { name: id.trim(), weight: 1 });

			if (setting === 'name') {
				coll.name = value as string;
			}

			if (setting === 'value') {
				const num = Number(value);
				if (isNaN(num)) continue;
				coll.weight = num;
			}
		}

		const body: components['schemas']['EditEventDto'] = {
			guildId: guildId,
			collectionData: {
				collectionWeights: weights,
			},
		};

		const { response, error: e } = await EditEvent(token, eventId, guildId, body).catch((e) => {
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
			return fail(response.status, { error: e || 'Failed to force add member!' });
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
			return fail(response.status, { error: e ?? 'Failed to delete member!' });
		}

		return {
			success: true,
		};
	},
	promoteMember: async ({ locals, params, request }) => {
		const { access_token: token, session } = locals;
		const { id: guildId } = params;

		if (!token || !session) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const eventId = data.get('id') as string;
		const teamId = (data.get('team') as string) || undefined;
		const memberUuid = (data.get('member') as string) || undefined;

		if (!eventId || !teamId || !memberUuid || !guildId) {
			return fail(400, { error: 'Invalid request' });
		}

		const { response: codeResponse, error: problem } = await AdminTransferEventTeamOwnership(token, {
			guildId,
			eventId,
			teamId,
			playerUuid: memberUuid,
		});

		if (!codeResponse.ok) {
			return fail(codeResponse.status, { error: 'Failed to transfer team ownership!', problem });
		}

		return { success: true };
	},
	kickTeamMember: async ({ locals, params, request }) => {
		const { access_token: token, session } = locals;
		const { id: guildId } = params;

		if (!token || !session) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const eventId = data.get('id') as string;
		const teamId = (data.get('team') as string) || undefined;
		const memberUuid = (data.get('member') as string) || undefined;

		if (!eventId || !teamId || !memberUuid || !guildId) {
			return fail(400, { error: 'Invalid request' });
		}

		const { response: codeResponse, error: problem } = await AdminKickTeamMember(
			token,
			guildId,
			eventId,
			memberUuid,
			teamId
		);

		if (!codeResponse.ok) {
			return fail(codeResponse.status, { error: 'Failed to kick team member!', problem });
		}

		return { success: true };
	},
	deleteTeam: async ({ locals, params, request }) => {
		const { access_token: token, session } = locals;
		const { id: guildId } = params;

		if (!token || !session) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const eventId = data.get('id') as string;
		const teamId = (data.get('team') as string) || undefined;

		if (!eventId || !teamId || !guildId) {
			return fail(400, { error: 'Invalid request' });
		}

		const { response: codeResponse, error: problem } = await AdminDeleteTeam(token, guildId, eventId, teamId);

		if (!codeResponse.ok) {
			return fail(codeResponse.status, { error: 'Failed to kick team member!', problem });
		}

		return { success: true };
	},
	addMemberToTeam: async ({ locals, params, request }) => {
		const { access_token: token, session } = locals;
		const { id: guildId } = params;

		if (!token || !session) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const eventId = data.get('id') as string;
		const teamId = (data.get('team') as string) || undefined;
		const memberUuid = (data.get('member') as string) || undefined;

		if (!eventId || !teamId || !memberUuid || !guildId) {
			return fail(400, { error: 'Invalid request' });
		}

		const { response: codeResponse, error: problem } = await AddMemberToTeam(
			token,
			guildId,
			eventId,
			teamId,
			memberUuid
		);

		if (!codeResponse.ok) {
			return fail(codeResponse.status, { error: 'Failed to add member to team!', problem });
		}

		return { success: true };
	},
	createTeam: async ({ locals, params, request }) => {
		const { access_token: token, session } = locals;
		const { id: guildId } = params;

		if (!token || !session) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const eventId = data.get('id') as string;
		const teamName = (data.get('name') as string) || undefined;
		const member = (data.get('member') as string) || undefined;

		if (!eventId || !teamName || !guildId || !member) {
			return fail(400, { error: 'Invalid request' });
		}

		const { response: codeResponse, error: problem } = await AdminCreateEventTeam(token, guildId, eventId, member, {
			name: teamName
				.split(' ')
				.filter((w) => w)
				.map((w) => w.replace('_', ' ')),
		});

		if (!codeResponse.ok) {
			return fail(codeResponse.status, { error: 'Failed to create team!', problem });
		}

		return { success: true };
	},
};
