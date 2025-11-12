import { addRoleToUser, getAdmins, getAllProducts, getRoles, removeRoleFromUser } from '$lib/api';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent, locals }) => {
	const { session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.perms.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: roles } = await getRoles().catch(() => ({ data: undefined }));

	if (!roles) {
		throw error(500, 'Failed to fetch roles');
	}

	const { data: admins } = await getAdmins().catch(() => ({ data: undefined }));
	const { data: products } = await getAllProducts().catch(() => ({ data: undefined }));

	return {
		user: locals.user,
		roles,
		admins: admins ?? [],
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

		const { response } = await addRoleToUser(memberId as unknown as number, role);

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

		const { response } = await removeRoleFromUser(memberId as unknown as number, role);

		if (!response.ok) {
			return fail(500, { error: 'Failed to demote user' });
		}

		return {
			success: true,
		};
	},
};
