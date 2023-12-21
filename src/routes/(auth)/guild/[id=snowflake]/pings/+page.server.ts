import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { CanManageGuild } from '$lib/utils';
import { DisableUpcomingContestPings, GetGuild, UpdateUpcomingContestPings } from '$lib/api/elite';

export const load: PageServerLoad = async ({ parent }) => {
	const { userPermissions, guild } = await parent();

	const hasPerms = CanManageGuild(userPermissions);

	if (!hasPerms) {
		throw error(403, 'You do not have permission to edit this guild.');
	}

	if (!guild?.features?.contestPingsEnabled) {
		throw error(402, 'This guild does not have the Jacob Contest Pings feature enabled.');
	}

	return {
		pings: guild.features.contestPings,
	};
};

export const actions: Actions = {
	enable: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { discord_access_token: token } = locals;

		if (!locals.user || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		// Check if guild exists and if user has perms
		await getGuild(guildId, token);

		const data = await request.formData();

		const { response } = await UpdateUpcomingContestPings(token, guildId, {
			enabled: true,
			guildId: guildId,
			channelId: data.get('channel') as string,
			alwaysPingRole: data.get('pingrole') as string ?? null,
			cropPingRoles: {
				cactus: data.get('cactus') as string ?? null,
				carrot: data.get('carrot') as string ?? null,
				potato: data.get('potato') as string ?? null,
				wheat: data.get('wheat') as string ?? null,
				melon: data.get('melon') as string ?? null,
				pumpkin: data.get('pumpkin') as string ?? null,
				mushroom: data.get('mushroom') as string ?? null,
				cocoaBeans: data.get('cocoaBeans') as string ?? null,
				sugarCane: data.get('sugarCane') as string ?? null,
				netherWart: data.get('netherWart') as string ?? null,
			}
		}).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (response.status !== 200) {
			const msg = await response.text();
			return { success: false, message: msg };
		}

		return {
			success: true,
		};
	},
	disable: async ({ locals, params }) => {
		const guildId = params.id;
		const { discord_access_token: token } = locals;

		if (!locals.user || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		// Check if guild exists and if user has perms
		await getGuild(guildId, token);

		const { response } = await DisableUpcomingContestPings(token, guildId, 'Manually disabled').catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (response.status !== 200) {
			const msg = await response.text();
			return { success: false, message: msg };
		}

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

	if (!guild.guild?.features?.jacobLeaderboardEnabled) {
		throw error(402, 'This guild does not have the Jacob Contest Pings feature enabled.');
	}

	return guild;
}
