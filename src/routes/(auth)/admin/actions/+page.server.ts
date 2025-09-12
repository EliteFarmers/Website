import {
	clearPlayerCooldowns,
	deleteUpcomingContests,
	grantTestEntitlement,
	linkUserAccount,
	refreshDiscordGuild,
	removeTestEntitlement,
	unlinkUserAccount,
} from '$lib/api';
import { reloadCachedItems } from '$lib/servercache';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const { access_token: token, user, session } = locals;

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

		const { response } = await deleteUpcomingContests();

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

		const { response, error: e } = await clearPlayerCooldowns(playerId);

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

		const { response, error: e } = await refreshDiscordGuild(guildId);

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

		const { response, error: e } = await linkUserAccount({
			player: playerId,
			discordId: discordId,
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

		const { response, error: e } = await unlinkUserAccount({
			discordId: discordId,
			player: playerId,
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

		const { response, error: e } = await grantTestEntitlement(
			playerId as unknown as number,
			productId as unknown as number
		);

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

		const { response, error: e } = await removeTestEntitlement(
			playerId as unknown as number,
			productId as unknown as number
		);

		if (!response.ok) {
			return fail(500, { error: e || 'Failed to revoke entitlement' });
		}

		return {
			success: true,
		};
	},
};
