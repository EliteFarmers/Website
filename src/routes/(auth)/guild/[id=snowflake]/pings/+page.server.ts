import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { CanManageGuild } from '$lib/utils';
import { DisableUpcomingContestPings, UpdateUpcomingContestPings } from '$lib/api/elite';

export const load: PageServerLoad = async ({ parent, locals }) => {
	const { authGuild, guild } = await parent();

	const hasPerms = CanManageGuild(authGuild, locals.session);

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
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const body = {
			enabled: true,
			guildId: guildId,
			channelId: data.get('channel') as string,
			alwaysPingRole: (data.get('pingrole') as string) ?? null,
			delaySeconds: 0,
			cropPingRoles: {
				cactus: (data.get('cactus') as string) ?? null,
				carrot: (data.get('carrot') as string) ?? null,
				potato: (data.get('potato') as string) ?? null,
				wheat: (data.get('wheat') as string) ?? null,
				melon: (data.get('melon') as string) ?? null,
				pumpkin: (data.get('pumpkin') as string) ?? null,
				mushroom: (data.get('mushroom') as string) ?? null,
				cocoaBeans: (data.get('cocoa') as string) ?? null,
				sugarCane: (data.get('cane') as string) ?? null,
				netherWart: (data.get('wart') as string) ?? null,
			},
		};

		const { response, error: e } = await UpdateUpcomingContestPings(token, guildId, body).catch(() => {
			throw error(500, 'Internal Server Error');
		});

		if (!response.ok || e) {
			return fail(response.status, { error: e ?? 'Unknown error' });
		}

		return {
			success: true,
		};
	},
	disable: async ({ locals, params }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const { response, error: e } = await DisableUpcomingContestPings(token, guildId, 'Manually disabled').catch(
			(e) => {
				console.log(e);
				throw error(500, 'Internal Server Error');
			}
		);

		if (!response.ok || e) {
			return fail(response.status, { error: e ?? 'Unknown error' });
		}

		return {
			success: true,
		};
	},
};
