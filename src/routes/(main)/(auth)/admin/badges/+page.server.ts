import { addBadgeToUserBadge, createBadge, deleteBadge, deleteBadgeFromUserBadge, updateBadge } from '$lib/api';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const { access_token: token, user, session } = locals;

	if (!session || !session.perms.moderator || !token) {
		throw error(404, 'Not Found');
	}

	return {
		user,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	createbadge: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const badgeName = data.get('name') as string;
		const badgeImage = data.get('image') as Blob;
		const badgeDescription = data.get('description') as string;
		const badgeRequirements = data.get('requirements') as string;
		const tied = data.get('tied') as string;

		const { ok, error: e } = await createBadge({
			image: badgeImage,
			name: badgeName,
			description: badgeDescription,
			requirements: badgeRequirements,
			tieToAccount: tied === 'on',
		});

		if (!ok) {
			return fail(500, { error: e || 'Failed to create badge' });
		}

		return {
			success: true,
		};
	},
	editbadge: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const badgeId = data.get('badgeId') as string;
		const badgeName = data.get('name') as string;
		const badgeImage = data.get('image') as Blob;
		const badgeDescription = data.get('description') as string;
		const badgeRequirements = data.get('requirements') as string;

		const { ok, error: e } = await updateBadge(badgeId, {
			image: badgeImage,
			name: badgeName,
			description: badgeDescription,
			requirements: badgeRequirements,
		});

		if (!ok) {
			return fail(500, { error: e || 'Failed to edit badge' });
		}

		return {
			success: true,
		};
	},
	deleteBadge: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const badgeId = data.get('id') as string;

		const { ok, error: e } = await deleteBadge(badgeId);

		if (!ok) {
			return fail(500, { error: e || 'Failed to delete badge' });
		}

		return {
			success: true,
		};
	},
	adduserbadge: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const playerUuid = data.get('uuid') as string;
		const badgeId = data.get('badgeId') as string;

		const { ok, error: e } = await addBadgeToUserBadge(playerUuid, badgeId);

		if (!ok) {
			return fail(500, { error: e || 'Failed to add badge.' });
		}

		return {
			success: true,
		};
	},
	deleteuserbadge: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const playerUuid = data.get('uuid') as string;
		const badgeId = data.get('badgeId') as string;

		const { ok, error: e } = await deleteBadgeFromUserBadge(playerUuid, badgeId);

		if (!ok) {
			return fail(500, { error: e || 'Failed to delete badge.' });
		}

		return {
			success: true,
		};
	},
};
