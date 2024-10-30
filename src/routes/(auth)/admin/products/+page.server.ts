import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { components } from '$lib/api/api';
import { UpdateProduct } from '$lib/api/elite';

export const load = (async ({ parent, locals }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	return {
		user,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	updateProduct: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const productId = data.get('product') as string;

		if (!productId) {
			return fail(400, { error: 'Invalid product ID.' });
		}

		const badgeId = data.get('badge') as string | undefined;

		const body = {
			icon: (data.get('icon') as string) || undefined,
			description: (data.get('name') as string) || undefined,
			features: {
				badgeId: badgeId ? +badgeId : undefined,
				hideShopPromotions: data.get('promotions') === 'true',
				weightStyleOverride: data.get('override') === 'true',
				moreInfoDefault: data.get('info') === 'true',
				weightStyles: (data.getAll('style') as string[])?.filter((s) => s) ?? undefined,
				embedColors: (data.getAll('color') as string[])?.filter((c) => c) ?? undefined,
			},
		} satisfies components['schemas']['UpdateProductDto'];

		const req = await UpdateProduct(locals.access_token, productId, body);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		return { success: true };
	},
};
