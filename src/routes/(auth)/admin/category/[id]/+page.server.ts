import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GetShopCategory, UpdateShopCategory } from '$lib/api/elite';

export const load = (async ({ parent, locals, params }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: category } = await GetShopCategory(params.id, token).catch(() => ({ data: undefined }));

	if (!category) {
		throw error(404, 'Category Not Found');
	}

	return {
		user,
		category,
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
};
