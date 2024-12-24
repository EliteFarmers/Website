import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { GetAdminProducts, RefreshProducts } from '$lib/api/elite';

export const load = (async ({ parent, locals }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: products } = await GetAdminProducts(token).catch(() => ({ data: undefined }));

	return {
		user,
		products: products ?? [],
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	refresh: async ({ locals }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		await RefreshProducts(locals.access_token);

		await new Promise((resolve) => setTimeout(resolve, 1000));

		return { success: true };
	},
};
