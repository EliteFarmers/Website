import { error, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DELETE, GET, GetAllBadges, PATCH, POST } from '$lib/api/elite';
import { hasPermission, PermissionFlags, PERMISSIONS } from '$lib/auth';

export const load = (async ({ parent, locals, setHeaders }) => {
	const { user } = await parent();
	const { access_token: token } = locals;

	setHeaders({
		'Cache-Control': 'no-store',
	});

	if (!token || !hasPermission(user, PermissionFlags.Admin)) {
		throw error(404, 'Not Found');
	}

	const { data: admins } = await GET('/Admins', {
		headers: { Authorization: `Bearer ${token}` },
	}).catch(() => ({ data: undefined }));

	const { data: badges } = await GetAllBadges().catch(() => ({ data: undefined }));

	return {
		user,
		admins: admins ?? [],
		permissions: PERMISSIONS,
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
		const permission = data.get('permission') as string;

		const { response } = await POST(`/Admin/Permissions/{memberId}/{permission}`, {
			params: {
				path: {
					memberId: memberId as unknown as number,
					permission: permission as unknown as number,
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
		const permission = data.get('permission') as string;

		const { response } = await DELETE(`/Admin/Permissions/{memberId}/{permission}`, {
			params: {
				path: {
					memberId: memberId as unknown as number,
					permission: permission as unknown as number,
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

		const { response } = await DELETE(`/Admin/UpcomingContests`, {
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

		const { response } = await POST('/Admin/Badges', {
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

		const { response } = await PATCH('/Admin/Badges/{badgeId}', {
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

		const { response } = await DELETE('/Admin/Badges/{badgeId}', {
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

		const { response } = await POST('/Admin/Badges/{playerUuid}/{badgeId}', {
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

		const { response } = await DELETE('/Admin/Badges/{playerUuid}/{badgeId}', {
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
