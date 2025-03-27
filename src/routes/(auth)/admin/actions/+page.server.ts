import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DELETE, POST } from '$lib/api/elite';

export const load = (async ({ parent, locals }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	return {
		user,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	clearcontests: async ({ locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const { response } = await DELETE(`/admin/upcomingcontests`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to delete contests' });
		}

		return {
			success: true,
		};
	},
	resetCooldowns: async ({ locals, request }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const playerId = data.get('player') as string;

		const { response, error: e } = await POST(`/admin/cooldowns/player/{player}`, {
			params: {
				path: { player: playerId },
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			return fail(500, { error: e || 'Failed to reset cooldowns' });
		}

		return {
			success: true,
		};
	},
};
