import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DELETE, POST } from '$lib/api/elite';
import { reloadCachedItems } from '$lib/servercache';

export const load = (async ({ parent, locals }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	return {
		user,
		subscriptions: locals.cache?.products.filter((p) => p.isSubscription) ?? [],
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	clearcontests: async ({ locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			return fail(401, { error: 'Unauthorized' });
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
			return fail(401, { error: 'Unauthorized' });
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
	refreshGuild: async ({ locals, request }) => {
		const { access_token: token } = locals;

		if (!token) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const guildId = data.get('guild') as string;

		const { response, error: e } = await POST(`/admin/guild/{guildId}/refresh`, {
			params: {
				path: { guildId: guildId as unknown as number },
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
	refreshWebsite: async ({ locals }) => {
		const { session } = locals;

		if (!session?.flags.admin) {
			return fail(401, { error: 'Unauthorized' });
		}

		await reloadCachedItems();

		return {
			success: true,
		};
	},
	linkAccount: async ({ locals, request }) => {
		const { access_token: token } = locals;

		if (!token) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const playerId = data.get('player') as string;
		const discordId = data.get('discord') as string;

		const { response, error: e } = await POST('/admin/link-account', {
			body: {
				discordId: discordId,
				player: playerId,
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			return fail(500, { error: e || 'Failed to link account' });
		}

		return {
			success: true,
		};
	},
	unlinkAccount: async ({ locals, request }) => {
		const { access_token: token } = locals;

		if (!token) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const playerId = data.get('player') as string;
		const discordId = data.get('discord') as string;

		const { response, error: e } = await POST('/admin/unlink-account', {
			body: {
				discordId: discordId,
				player: playerId,
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			return fail(500, { error: e || 'Failed to unlink account' });
		}

		return {
			success: true,
		};
	},
	grantTestEntitlement: async ({ locals, request }) => {
		const { access_token: token } = locals;

		if (!token || !locals.session?.flags.admin) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const playerId = data.get('player') as string;
		const productId = data.get('product') as string;

		const { response, error: e } = await POST('/account/{discordId}/entitlement/{productId}', {
			params: {
				path: {
					discordId: playerId as unknown as number,
					productId: productId as unknown as number,
				},
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			return fail(500, { error: e || 'Failed to grant entitlement' });
		}

		return {
			success: true,
		};
	},
	revokeTestEntitlement: async ({ locals, request }) => {
		const { access_token: token } = locals;

		if (!token || !locals.session?.flags.admin) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const playerId = data.get('player') as string;
		const productId = data.get('product') as string;

		const { response, error: e } = await DELETE('/account/{discordId}/entitlement/{productId}', {
			params: {
				path: {
					discordId: playerId as unknown as number,
					productId: productId as unknown as number,
				},
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			return fail(500, { error: e || 'Failed to revoke entitlement' });
		}

		return {
			success: true,
		};
	},
};
