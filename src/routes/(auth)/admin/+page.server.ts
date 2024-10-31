import { error, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DELETE, GET, GetAllBadges, GetProducts, POST } from '$lib/api/elite';

export const load = (async ({ parent, locals }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

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
	const { data: products } = await GetProducts().catch(() => ({ data: undefined }));

	return {
		user,
		roles,
		admins: admins ?? [],
		badges: badges ?? [],
		products: products ?? [],
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
};
