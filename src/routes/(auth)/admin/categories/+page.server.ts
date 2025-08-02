import { CreateShopCategory, GetShopCategories, UpdateCategoryOrder, UpdateShopCategory } from '$lib/api/elite';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ parent, locals }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: categories } = await GetShopCategories(true, token).catch(() => ({ data: undefined }));

	return {
		user,
		categories: categories ?? [],
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	updateOrder: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const entries = Array.from(data.entries()).filter(([key]) => key.startsWith('order.'));

		const order = [];

		for (let i = 0; i < entries.length; i++) {
			const [key] = entries[i];
			const [, id] = key.split('.');

			if (!id) {
				return fail(400, { error: 'Invalid order data.' });
			}

			order.push({ id: +id, order: i });
		}

		const { response, error: e } = await UpdateCategoryOrder(locals.access_token, { elements: order });

		if (e || !response.ok) {
			return fail(response.status ?? 400, { error: e || 'Failed to update order.' });
		}

		return { success: true };
	},
	createCategory: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const slug = data.get('slug') as string;

		if (!title || !description || !slug) {
			return fail(400, { error: 'Invalid category data.' });
		}

		const { response, error: e } = await CreateShopCategory(locals.access_token, { title, description, slug });

		if (e || !response.ok) {
			return fail(response.status ?? 400, { error: e || 'Failed to create category.' });
		}

		return { success: true };
	},
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

		const { response, error: e } = await UpdateShopCategory(locals.access_token, id, {
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
};
