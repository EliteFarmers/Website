import { claimProduct } from '$lib/api';
import { getSelectedMember } from '$lib/remote';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params, locals, parent }) => {
	const parentData = await parent();
	const products = locals.cache?.products?.list ?? [];
	const product = products?.find((p) => p.id === params.sku);
	const categories = parentData.categories ?? [];

	if (!product) {
		error(404, 'Product Not Found');
	}

	const productCategories = categories.filter((category) =>
		(category.products ?? []).some((categoryProduct) => categoryProduct.id === product.id)
	);
	const primaryCategory = productCategories[0];
	const relatedProducts = [
		...new Map(
			productCategories
				.flatMap((category) => category.products ?? [])
				.filter((categoryProduct) => categoryProduct.id !== product.id)
				.map((categoryProduct) => [categoryProduct.id, categoryProduct])
		).values(),
	].slice(0, 4);

	if (!locals.session?.uuid) {
		return {
			product,
			productCategories,
			primaryCategory,
			relatedProducts,
		};
	}

	const weight = await getSelectedMember({ playerUuid: locals.session.uuid });

	return {
		product,
		productCategories,
		primaryCategory,
		relatedProducts,
		uuid: locals.session.uuid,
		ign: locals.session.ign,
		weight: weight?.farmingWeight,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	claim: async ({ request, locals, url }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw redirect(307, '/login?redirect=' + encodeURIComponent(url.pathname));
		}
		const data = await request.formData();
		const sku = data.get('sku') as string;
		if (!sku) {
			return { error: 'Invalid SKU.' };
		}

		const { response, error: e } = await claimProduct(sku);
		if (!response.ok) {
			return fail(500, { error: e || 'Failed to claim item!' });
		}

		redirect(303, '/profile/settings');
	},
};
