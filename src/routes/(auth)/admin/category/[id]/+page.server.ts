import {
	addProductToCategory,
	getAllProducts,
	getCategory,
	removeProductToCategory,
	reorderCategoryProducts,
	updateCategory,
} from '$lib/api';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent, locals, params }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: category } = await getCategory(params.id).catch(() => ({ data: undefined }));
	const { data: products } = await getAllProducts().catch(() => ({ data: undefined }));

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
			return fail(400, { error: 'Invalid category data.' });
		}

		const { response, error: e } = await updateCategory(id, {
			title,
			description,
			slug,
			published,
		});

		if (e || !response.ok) {
			return fail(response.status ?? 400, { error: e || 'Failed to edit category.' });
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

		const { response, error: e } = await addProductToCategory(categoryId, productId);

		if (e || !response.ok) {
			return fail(response.status ?? 400, { error: e || 'Failed to add product.' });
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

		const { ok, error: e } = await removeProductToCategory(categoryId, productId);

		if (e || !ok) {
			return fail(400, { error: e || 'Failed to remove product.' });
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
				return fail(400, { error: 'Invalid order data.' });
			}

			order.push({ id: id, order: i });
		}

		const { response, error: e } = await reorderCategoryProducts(categoryId, {
			elements: order,
		});

		if (e || !response.ok) {
			return fail(response.status ?? 400, { error: e });
		}

		return { success: true };
	},
};
