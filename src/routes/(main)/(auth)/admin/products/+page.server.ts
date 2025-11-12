import { getAllProducts, refreshProducts } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const { access_token: token, user, session } = locals;

	if (!session || !session.perms.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: products } = await getAllProducts().catch(() => ({ data: undefined }));

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

		await refreshProducts();

		await new Promise((resolve) => setTimeout(resolve, 1000));

		return { success: true };
	},
};
