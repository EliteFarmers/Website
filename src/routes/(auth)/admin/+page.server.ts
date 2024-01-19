import { error, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DELETE, GET, POST } from '$lib/api/elite';

export const load = (async ({ parent, locals, setHeaders }) => {
	const { user } = await parent();
	const { discord_access_token: token } = locals;

	setHeaders({
		'Cache-Control': 'no-store',
	});

	if (!token || user.permissions !== PermissionFlags.Admin) {
		throw error(404, 'Not Found');
	}

	const { data: admins } = await GET('/Admins', {
		headers: { Authorization: `Bearer ${token}` },
	}).catch(() => ({ data: undefined }));

	return {
		user,
		admins: admins ?? [],
		permissions,
	};
}) satisfies PageServerLoad;

enum PermissionFlags {
	None = 0,
	Helper = 16,
	ViewGraphs = 17,
	Moderator = 32,
	Admin = 64,
}

const permissions = {
	[PermissionFlags.None]: {
		name: 'None',
		description: 'No permissions',
	},
	[PermissionFlags.Helper]: {
		name: 'Helper',
		description: 'Currently no permissions',
	},
	[PermissionFlags.ViewGraphs]: {
		name: 'View Stats',
		description: 'View some player stats',
	},
	[PermissionFlags.Moderator]: {
		name: 'Moderator',
		description: 'Moderator permissions',
	},
	[PermissionFlags.Admin]: {
		name: 'Admin',
		description: 'All permissions, super user',
	},
};

export const actions: Actions = {
	promote: async ({ request, locals }) => {
		const { discord_access_token: token } = locals;

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

		if (response.ok) {
			return fail(500, { error: 'Failed to promote user' });
		}

		return {
			success: true,
		};
	},
	demote: async ({ request, locals }) => {
		const { discord_access_token: token } = locals;

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

		if (response.ok) {
			return fail(500, { error: 'Failed to demote user' });
		}

		return {
			success: true,
		};
	},
	clearcontests: async ({ locals }) => {
		const { discord_access_token: token } = locals;

		if (!token) {
			throw error(404, 'Not Found');
		}

		const { response } = await DELETE(`/Admin/UpcomingContests`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (response.ok) {
			return fail(500, { error: 'Failed to delete contests' });
		}

		return {
			success: true,
		};
	},
};
