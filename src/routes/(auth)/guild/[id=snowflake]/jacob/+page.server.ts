import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { CanManageGuild } from '$lib/utils';
import { AddGuildJacobLeadeboard, GetGuild } from '$lib/api/elite';

export const load: PageServerLoad = async ({ parent }) => {
	const { userPermissions, guild } = await parent();

	const hasPerms = CanManageGuild(userPermissions);

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
		console.log('create');

		const guildId = params.id;
		const { discord_access_token: token } = locals;

		if (!locals.user || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const guild = await GetGuild(guildId, token)
			.then((guild) => guild.data ?? undefined)
			.catch(() => undefined);
		if (!guild) throw error(404, 'Guild not found');

		const hasPerms = CanManageGuild(guild.permissions);
		if (!hasPerms) throw error(403, 'You do not have permission to edit this guild.');

		if (!guild.guild?.features?.jacobLeaderboardEnabled) {
			throw error(402, 'This guild does not have the Jacob Leaderboard feature enabled.');
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

		const { response } = await AddGuildJacobLeadeboard(guildId, token, {
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
		}).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		console.log(response);

		if (response.status !== 200) {
			const msg = await response.text();
			throw error(response.status, msg);
		}

		return {
			success: true,
		};
	},
};
