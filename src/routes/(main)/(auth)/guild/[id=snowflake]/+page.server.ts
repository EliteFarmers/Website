import { setAdminRole, setEventFeature, setGuildPublic, setInvite, setJacobFeature } from '$lib/api';
import { error, fail, type Actions, type NumericRange } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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

		const data = await request.formData();
		const invite = data.get('invite') as string;

		if (!invite) {
			return fail(400, { error: 'Invite is required' });
		}

		const { response, error: e } = await setInvite(guildId, invite);

		if (!response.ok) {
			const msg = e || 'Missing permissions to set invite! (admin only)';
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

		const { response, error: e } = await setAdminRole(guildId, role);

		if (!response.ok || e) {
			const msg = e || 'Missing permissions to set admin role! (admin only)';
			return fail(response.status as NumericRange<400, 499>, { error: msg });
		}

		return {
			success: true,
		};
	},
	setPublic: async ({ params, locals, request }) => {
		const guildId = params.id;
		const { session, access_token: token } = locals;

		if (!session?.perms.admin || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const enable = data.get('visibility') === 'true';

		if (guildId === undefined) {
			return fail(400, { error: 'guildId is required' });
		}

		const { response, error: e } = await setGuildPublic(guildId, { public: enable });

		if (!response.ok || e) {
			return fail(400, { error: e?.message ?? 'Failed to update guild visibility' });
		}

		return {
			success: true,
		};
	},
	updateJacob: async ({ params, locals, request }) => {
		const guildId = params.id;
		const { session, access_token: token } = locals;

		if (!session?.perms.admin || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const enable = data.get('enable') === 'true';
		const max = data.get('max') as string;

		if (guildId === undefined) {
			return fail(400, { error: 'guildId is required' });
		}

		if (max === undefined || Number.isNaN(+max)) {
			return fail(400, { error: 'max is required' });
		}

		const { response, error: e } = await setJacobFeature(guildId, { max: +max, enable });

		if (!response.ok) {
			const msg = e || "Failed to set Jacob's leaderboards!";
			return fail(response.status as NumericRange<400, 499>, { error: msg });
		}

		return {
			success: true,
		};
	},
	updateEvents: async ({ params, locals, request }) => {
		const guildId = params.id;
		const { session, access_token: token } = locals;

		if (!session?.perms.admin || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const enable = data.get('enable') === 'true';
		const max = data.get('max') as string;

		if (guildId === undefined) {
			return fail(400, { error: 'guildId is required' });
		}

		if (max === undefined || Number.isNaN(+max)) {
			return fail(400, { error: 'max is required' });
		}

		const { response, error: e } = await setEventFeature(guildId, { max: +max, enable });

		if (!response.ok || e) {
			const msg = e || 'Failed to set events!';
			return fail(response.status as NumericRange<400, 499>, { error: msg });
		}

		return {
			success: true,
		};
	},
};
