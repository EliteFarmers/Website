import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GetAdminProducts } from '$lib/api/elite';

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
