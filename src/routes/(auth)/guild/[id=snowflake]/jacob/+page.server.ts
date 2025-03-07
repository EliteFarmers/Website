import { error, fail, type NumericRange } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { CanManageGuild } from '$lib/utils';
import {
	AddGuildJacobLeadeboard,
	DeleteGuildJacobLeadeboard,
	GetGuild,
	PatchGuildJacob,
	SendGuildJacobLeadeboard,
	UpdateGuildJacobLeadeboard,
} from '$lib/api/elite';
import type { components } from '$lib/api/api';

export const load: PageServerLoad = async ({ parent, locals }) => {
	const { authGuild, guild } = await parent();

	const hasPerms = CanManageGuild(authGuild, locals.session);

	if (!hasPerms) {
		throw error(403, 'You do not have permission to edit this guild.');
	}

	if (!guild?.features?.jacobLeaderboardEnabled) {
		throw error(402, 'This guild does not have the Jacob Leaderboard feature enabled.');
	}

	return {
		...guild.features.jacobLeaderboard,
	};
};

export const actions: Actions = {
	create: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const title = data.get('title') as string;
		const sendToChannelId = data.get('sendToChannelId') as string;
		const mentionRoleId = data.get('mentionRoleId') as string;
		const updatesChannelId = data.get('updatesChannelId') as string;
		const tinyUpdatesPing = data.get('tinyUpdatesPing') === 'on';
		const requiredRoleId = data.get('requiredRoleId') as string;
		const blockedRoleId = data.get('blockedRoleId') as string;
		const startDate = data.get('startDate') as string;
		const endDate = data.get('endDate') as string;

		const body = {
			id: (parseInt(guildId) + Math.floor(Math.random() * 1000000)).toString(),
			title,
			channelId: sendToChannelId,
			updateChannelId: updatesChannelId,
			updateRoleId: mentionRoleId,
			pingForSmallImprovements: tinyUpdatesPing,
			startCutoff: startDate ? new Date(startDate).getTime() / 1000 : undefined,
			endCutoff: endDate ? new Date(endDate).getTime() / 1000 : undefined,
			requiredRole: requiredRoleId,
			blockedRole: blockedRoleId,
		};

		const { response } = await AddGuildJacobLeadeboard(guildId, token, body).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok) {
			const msg = await response.text();
			throw error(response.status as NumericRange<400, 599>, msg);
		}

		return {
			success: true,
		};
	},
	delete: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const lbId = data.get('id') as string;

		if (!lbId) throw error(400, 'Missing required field: id');

		const { response } = await DeleteGuildJacobLeadeboard(guildId, token, lbId).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok) {
			const msg = await response.text();
			throw error(response.status as NumericRange<400, 599>, msg);
		}

		return {
			success: true,
		};
	},
	send: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const lbId = data.get('id') as string;

		if (!lbId) throw error(400, 'Missing required field: id');

		const { response } = await SendGuildJacobLeadeboard(guildId, token, lbId).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok) {
			const msg = await response.text();
			throw error(response.status as NumericRange<400, 599>, msg);
		}

		return {
			success: true,
		};
	},
	clear: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const guild = await getGuild(guildId, token, locals.session);

		const data = await request.formData();
		const lbId = data.get('id') as string;

		if (!lbId) return fail(400, { error: 'Missing required field: id' });

		const feature = guild.guild?.features?.jacobLeaderboard;
		const lbIndex = feature?.leaderboards?.findIndex((lb) => lb.id === lbId) ?? -1;
		const lb = feature?.leaderboards?.[lbIndex];

		if (!feature || !lb?.crops || lbIndex === -1) return fail(404, { error: 'Leaderboard not found' });

		// Reset all fields in lb.crops to empty arrays
		for (const crop in lb.crops) {
			lb.crops[crop as keyof components['schemas']['CropRecords']] = [];
		}

		const { response } = await UpdateGuildJacobLeadeboard(guildId, token, lb).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok) {
			const msg = await response.text();
			throw error(response.status as NumericRange<400, 599>, msg);
		}

		return {
			success: true,
		};
	},
	banparticipation: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const guild = await getGuild(guildId, token);
		const data = await request.formData();

		const lbId = data.get('id') as string;
		const uuid = data.get('uuid') as string;
		const crop = data.get('crop') as string;
		const timestamp = data.get('time') as string;

		if (!lbId) return fail(400, { error: 'Missing required field: id' });
		if (!uuid) return fail(400, { error: 'Missing required field: uuid' });
		if (!crop) return fail(400, { error: 'Missing required field: crop' });
		if (!timestamp) return fail(400, { error: 'Missing required field: time' });

		const feature = guild.guild?.features?.jacobLeaderboard;
		if (!feature) throw error(404, 'Jacob Leaderboard feature not found');

		const lb = feature.leaderboards?.find((lb) => lb.id === lbId);
		if (!lb) return fail(404, { error: 'Leaderboard not found' });

		const key = `${timestamp}-${crop}-${uuid}`;

		if (feature.excludedParticipations?.includes(key)) return fail(409, { error: 'Already banned' });
		feature.excludedParticipations ??= [];

		feature.excludedParticipations.push(key);

		const { response } = await PatchGuildJacob(guildId, token, feature).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok) {
			const msg = await response.text();
			throw error(response.status as NumericRange<400, 599>, msg);
		}

		const keys = {
			'Sugar Cane': 'sugarCane',
			'Cocoa Beans': 'cocoaBeans',
			'Nether Wart': 'netherWart',
		};

		const cropKey = (
			crop in keys ? keys[crop as keyof typeof keys] : crop.toLowerCase()
		) as keyof components['schemas']['CropRecords'];

		lb.crops[cropKey] =
			lb.crops[cropKey]?.filter((p) => p.uuid !== uuid && p.record?.timestamp !== +timestamp) ?? [];

		const { response: response2 } = await UpdateGuildJacobLeadeboard(guildId, token, lb).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (response2.status !== 200) {
			const msg = await response2.text();
			throw error(response2.status as NumericRange<400, 599>, msg);
		}

		return {
			success: true,
		};
	},
	unbanparticipation: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const guild = await getGuild(guildId, token, locals.session);
		const data = await request.formData();

		const pId = data.get('participationId') as string;

		if (!pId) return fail(400, { error: 'Missing required field: id' });
		const feature = guild.guild?.features?.jacobLeaderboard;
		if (!feature) throw error(404, 'Jacob Leaderboard feature not found');

		feature.excludedParticipations ??= [];
		if (!feature.excludedParticipations.includes(pId)) {
			return fail(404, { error: "This banned participation wasn't found!" });
		}

		feature.excludedParticipations = feature.excludedParticipations.filter((p) => p !== pId);

		const { response } = await PatchGuildJacob(guildId, token, feature).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok) {
			const msg = await response.text();
			throw error(response.status as NumericRange<400, 599>, msg);
		}

		return {
			success: true,
		};
	},
	bantimespan: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const guild = await getGuild(guildId, token, locals.session);
		const data = await request.formData();

		const startDate = data.get('startDate') as string;
		const endDate = data.get('endDate') as string;
		const reason = data.get('reason') as string | undefined;

		if (!startDate) return fail(400, { error: 'Missing required field: startDate' });
		if (!endDate) return fail(400, { error: 'Missing required field: endDate' });

		const start = new Date(startDate);
		const end = new Date(endDate);

		if (isNaN(start.getTime())) return fail(400, { error: 'Invalid date: startDate' });
		if (isNaN(end.getTime())) return fail(400, { error: 'Invalid date: endDate' });

		const feature = guild.guild?.features?.jacobLeaderboard;
		if (!feature) throw error(404, 'Jacob Leaderboard feature not found');

		feature.excludedTimespans ??= [];

		const span = {
			start: Math.floor(start.getTime() / 1000),
			end: Math.floor(end.getTime() / 1000),
			reason,
		};

		if (feature.excludedTimespans.some((t) => t.start === span.start && t.end === span.end))
			return fail(409, { error: 'Timespan already excluded' });

		feature.excludedTimespans.push(span);

		const { response } = await PatchGuildJacob(guildId, token, feature).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok) {
			const msg = await response.text();
			throw error(response.status as NumericRange<400, 599>, msg);
		}

		return {
			success: true,
		};
	},
	unbantimespan: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const guild = await getGuild(guildId, token, locals.session);
		const data = await request.formData();

		const startTime = +((data.get('startTime') as string | undefined) ?? 0);
		const endTime = +((data.get('endTime') as string | undefined) ?? 0);

		if (!startTime) return fail(400, { error: 'Missing required field: startTime' });
		if (!endTime) return fail(400, { error: 'Missing required field: endTime' });

		const feature = guild.guild?.features?.jacobLeaderboard;
		if (!feature) throw error(404, 'Jacob Leaderboard feature not found');

		feature.excludedTimespans ??= [];

		if (!feature.excludedTimespans.some((t) => t.start === startTime && t.end === endTime))
			return fail(409, { error: 'Timespan already excluded' });

		feature.excludedTimespans = feature.excludedTimespans.filter((t) => t.start !== startTime || t.end !== endTime);

		const { response } = await PatchGuildJacob(guildId, token, feature).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok) {
			const msg = await response.text();
			throw error(response.status as NumericRange<400, 599>, msg);
		}

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

	const hasPerms = CanManageGuild(guild, session);
	if (!hasPerms) throw error(403, 'You do not have permission to edit this guild.');

	if (!guild.guild?.features?.jacobLeaderboardEnabled) {
		throw error(402, 'This guild does not have the Jacob Leaderboard feature enabled.');
	}

	return guild;
}
