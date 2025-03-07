import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GetAdminProducts, GetShopCategory, UpdateCategoryProductOrder, UpdateShopCategory } from '$lib/api/elite';
import { AddProductToCategory } from '$lib/api/elite';
import { RemoveProductFromCategory } from '$lib/api/elite';

export const load = (async ({ parent, locals, params }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: category } = await GetShopCategory(params.id, token).catch(() => ({ data: undefined }));
	const { data: products } = await GetAdminProducts(token).catch(() => ({ data: undefined }));

	if (!category) {
		throw error(404, 'Category Not Found');
	}

	return {
		user,
		category,
		products: products ?? [],
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	editCategory: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const id = data.get('id') as string;
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const slug = data.get('slug') as string;
		const published = data.get('published') === 'true';

		if (!id) {
			fail(400, { error: 'Invalid category data.' });
		}

		const { response, error: e } = await UpdateShopCategory(locals.access_token, id, {
			title,
			description,
			slug,
			published,
		});

		if (e || !response.ok) {
			fail(response.status ?? 400, { error: e || 'Failed to edit category.' });
		}

		return { success: true };
	},
	addProduct: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const categoryId = data.get('category') as string;
		const productId = data.get('product') as string;

		if (!categoryId || !productId) {
			return fail(400, { error: 'Invalid category Id or product.' });
		}

		const req = await AddProductToCategory(locals.access_token, categoryId, productId);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		return { success: true };
	},
	removeProduct: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const categoryId = data.get('category') as string;
		const productId = data.get('product') as string;

		if (!categoryId || !productId) {
			return fail(400, { error: 'Invalid category Id or product.' });
		}

		const req = await RemoveProductFromCategory(locals.access_token, categoryId, productId);

		if (!req.response.ok) {
			return fail(req.response.status, { error: await req.response.text() });
		}

		return { success: true };
	},
	updateOrder: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const categoryId = data.get('category') as string;
		const entries = Array.from(data.entries()).filter(([key]) => key.startsWith('order.'));

		const order = [];

		for (let i = 0; i < entries.length; i++) {
			const [key] = entries[i];
			const [, id] = key.split('.');

			if (!id) {
				fail(400, { error: 'Invalid order data.' });
			}

			order.push({ id: id, order: i });
		}

		console.log(order);

		const { response, error: e } = await UpdateCategoryProductOrder(locals.access_token, categoryId, {
			elements: order,
		});

		if (e || !response.ok) {
			fail(response.status ?? 400, { error: e || 'Failed to update order.' });
		}

		return { success: true };
	},
};
