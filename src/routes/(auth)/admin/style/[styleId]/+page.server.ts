import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { components } from '$lib/api/api';
import {
	AddCosmeticImage,
	CreateWeightStyle,
	DeleteWeightStyle,
	GetWeightStyle,
	RemoveCosmeticImage,
	UpdateWeightStyle,
} from '$lib/api/elite';
import { isValidWeightStyle } from '$lib/styles/style';

export const load = (async ({ parent, locals, params }) => {
	const { session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: style } = await GetWeightStyle(params.styleId).catch(() => ({ data: undefined }));

	if (!style) {
		throw error(404, 'Style Not Found');
	}

	return {
		style,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	updateStyle: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const styleId = data.get('style') as string;

		if (!styleId || isNaN(+styleId)) {
			return fail(400, { error: 'Invalid style ID.' });
		}

		const body: components['schemas']['WeightStyleWithDataDto'] = {
			id: +styleId,
			name: (data.get('name') as string) || undefined,
			styleFormatter: (data.get('formatter') as string) || undefined,
			description: (data.get('description') as string) || undefined,
		};

		const style = data.get('data') as string | undefined;
		if (style) {
			const styleData = JSON.parse(data.get('data') as string);

			if (!isValidWeightStyle(styleData)) {
				return fail(400, { error: 'Invalid style data.' });
			}

			body.data = styleData;
		}

		const { error: e, response } = await UpdateWeightStyle(locals.access_token, styleId, body);

		if (e) {
			return fail(response.status, { error: e });
		}

		return { success: true };
	},
	deleteStyle: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const styleId = data.get('style') as string;

		if (!styleId) {
			return fail(400, { error: 'Invalid style ID.' });
		}

		const { error: e, response } = await DeleteWeightStyle(locals.access_token, styleId);

		if (e) {
			return fail(response.status, { error: e });
		}

		redirect(307, '/admin/styles');
	},
	duplicate: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const styleId = data.get('style') as string;

		if (!styleId) {
			return fail(400, { error: 'Invalid style ID.' });
		}

		const { data: style } = await GetWeightStyle(styleId).catch(() => ({ data: undefined }));

		if (!style) {
			return fail(404, { error: 'Style not found.' });
		}

		const { error: e, response } = await CreateWeightStyle(locals.access_token, {
			name: style.name + ' (Copy)',
			styleFormatter: style.styleFormatter,
			description: style.description,
			data: style.data,
		});

		if (e) {
			return fail(response.status, { error: e });
		}

		redirect(307, '/admin/styles');
	},
	addImage: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const styleId = data.get('style') as string;

		if (!styleId) {
			return fail(400, { error: 'Invalid style ID.' });
		}

		const image = data.get('image') as string;
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const thumbnail = data.get('thumbnail') === 'true';

		if (!image) {
			return fail(400, { error: 'Invalid image data.' });
		}

		const { response, error: e } = await AddCosmeticImage(
			locals.access_token,
			styleId,
			{
				Image: image,
				Title: title,
				Description: description,
			},
			thumbnail
		);

		if (!response.ok || e) {
			return fail(response.status, { error: e });
		}

		return { success: true };
	},
	deleteImage: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const productId = data.get('style') as string;

		if (!productId) {
			return fail(400, { error: 'Invalid style ID.' });
		}

		const image = data.get('image') as string;

		if (!image) {
			return fail(400, { error: 'Invalid image data.' });
		}

		const { response, error: e } = await RemoveCosmeticImage(locals.access_token, productId, image);

		if (!response.ok || e) {
			return fail(response.status, { error: e });
		}

		return { success: true };
	},
};
