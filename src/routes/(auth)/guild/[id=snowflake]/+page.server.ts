import { error, fail, type Actions, type NumericRange } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GetGuild, SetGuildAdminRole, SetGuildInvite, SetGuildPublic } from '$lib/api/elite';

export const load: PageServerLoad = async ({ parent }) => {
	await parent();
	return {};
};

export const actions: Actions = {
	setInvite: async ({ params, locals, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const guild = await GetGuild(guildId, token)
			.then((guild) => guild.data ?? undefined)
			.catch(() => undefined);

		if (!guild) throw error(404, 'Guild not found');

		const data = await request.formData();
		const invite = data.get('invite') as string;

		if (!invite) {
			return fail(400, { error: 'Invite is required' });
		}

		const { response } = await SetGuildInvite(guildId, token, invite);

		if (response.status !== 200) {
			const msg = (await response.text()) || 'Missing permissions to set invite! (admin only)';
			return fail(response.status as NumericRange<400, 499>, { error: msg });
		}

		return {
			success: true,
		};
	},
	setAdminRole: async ({ params, locals, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const role = data.get('role') as string;

		if (!role) {
			return fail(400, { error: 'Role is required' });
		}

		const { response } = await SetGuildAdminRole(guildId, token, role);

		if (response.status !== 200) {
			const msg = (await response.text()) || 'Missing permissions to set admin role! (admin only)';
			return fail(response.status as NumericRange<400, 499>, { error: msg });
		}

		return {
			success: true,
		};
	},
	setPublic: async ({ params, locals, request }) => {
		const guildId = params.id;
		const { session, access_token: token } = locals;

		if (!session?.flags.admin || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const enable = data.get('visibility') === 'true';

		if (guildId === undefined) {
			return fail(400, { error: 'guildId is required' });
		}

		const { response } = await SetGuildPublic(guildId, token, enable);

		if (response.status !== 200) {
			const msg = await response.text();
			return fail(response.status as NumericRange<400, 499>, { error: msg });
		}

		return {
			success: true,
		};
	},
};
