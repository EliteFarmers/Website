import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	CreateShopCategory,
	GetAdminProducts,
	GetShopCategories,
	RefreshProducts,
	UpdateShopCategory,
} from '$lib/api/elite';

export const load = (async ({ parent, locals }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: products } = await GetAdminProducts(token).catch(() => ({ data: undefined }));
	const { data: categories } = await GetShopCategories(token).catch(() => ({ data: undefined }));

	return {
		user,
		products: products ?? [],
		categories: categories ?? [],
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
	createCategory: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const slug = data.get('slug') as string;

		if (!title || !description || !slug) {
			fail(400, { error: 'Invalid category data.' });
		}

		const { response, error: e } = await CreateShopCategory(locals.access_token, { title, description, slug });

		if (e || !response.ok) {
			fail(response.status ?? 400, { error: e || 'Failed to create category.' });
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
};
