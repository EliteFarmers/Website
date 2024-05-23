import { error, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DELETE, GET, GetAllBadges, PATCH, POST } from '$lib/api/elite';

export const load = (async ({ parent, locals, setHeaders }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	setHeaders({
		'Cache-Control': 'no-store',
	});

	if (!session || !session.flags.moderator) {
		throw error(404, 'Not Found');
	}

	const { data: roles } = await GET('/roles', {
		headers: { Authorization: `Bearer ${token}` },
	}).catch(() => ({ data: undefined }));

	if (!roles) {
		throw error(500, 'Failed to fetch roles');
	}

	const { data: admins } = await GET('/admins', {
		headers: { Authorization: `Bearer ${token}` },
	}).catch(() => ({ data: undefined }));

	const { data: badges } = await GetAllBadges().catch(() => ({ data: undefined }));

	return {
		user,
		roles,
		admins: admins ?? [],
		badges: badges ?? [],
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	promote: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const memberId = data.get('id') as string;
		const role = data.get('role') as string;

		const { response } = await POST('/admin/user/{userId}/roles/{role}', {
			params: {
				path: {
					userId: memberId,
					role: role,
				},
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to promote user' });
		}

		return {
			success: true,
		};
	},
	demote: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const memberId = data.get('id') as string;
		const role = data.get('role') as string;

		const { response } = await DELETE(`/admin/user/{userId}/roles/{role}`, {
			params: {
				path: {
					userId: memberId,
					role: role,
				},
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to demote user' });
		}

		return {
			success: true,
		};
	},
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
	createbadge: async ({ request, locals }) => {
		const { access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const data = await request.formData();
		const badgeName = data.get('name') as string;
		const badgeImageId = data.get('imageId') as string;
		const badgeDescription = data.get('description') as string;
		const badgeRequirements = data.get('requirements') as string;
		const tied = data.get('tied') as string;

		const { response } = await POST('/badge', {
			body: {
				imageId: badgeImageId,
				name: badgeName,
				description: badgeDescription,
				requirements: badgeRequirements,
				tieToAccount: tied === 'on',
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to create badge' });
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
		const badgeImageId = data.get('imageId') as string;
		const badgeDescription = data.get('description') as string;
		const badgeRequirements = data.get('requirements') as string;

		const { response } = await PATCH('/badge/{badgeId}', {
			params: {
				path: {
					badgeId: badgeId as unknown as number,
				},
			},
			body: {
				imageId: badgeImageId,
				name: badgeName,
				description: badgeDescription,
				requirements: badgeRequirements,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to edit badge' });
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

		const { response } = await DELETE('/badge/{badgeId}', {
			params: {
				path: {
					badgeId: badgeId as unknown as number,
				},
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to delete badge' });
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

		console.log(playerUuid, badgeId);

		const { response } = await POST('/badge/user/{playerUuid}/{badgeId}', {
			params: {
				path: {
					playerUuid,
					badgeId: badgeId as unknown as number,
				},
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to add badge.' });
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

		const { response } = await DELETE('/badge/user/{playerUuid}/{badgeId}', {
			params: {
				path: {
					playerUuid,
					badgeId: badgeId as unknown as number,
				},
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to delete badge.' });
		}

		return {
			success: true,
		};
	},
};
