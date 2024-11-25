import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { components } from '$lib/api/api';
import {
	CreateWeightStyle,
	DeleteWeightStyle,
	GetWeightStyle,
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

		const styleData = JSON.parse(data.get('data') as string);
		if (!isValidWeightStyle(styleData)) {
			return fail(400, { error: 'Invalid style data.' });
		}

		const body: components['schemas']['WeightStyleWithDataDto'] = {
			id: +styleId,
			name: data.get('name') as string,
			styleFormatter: (data.get('formatter') as string) || 'data',
			description: (data.get('description') as string) || undefined,
			data: styleData,
		};

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

		const { error: e, response } = await DeleteWeightStyle(
			locals.access_token,
			styleId,
		);

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

		const { error: e, response } = await CreateWeightStyle(
			locals.access_token,
			{
				name: style.name + ' (Copy)',
				styleFormatter: style.styleFormatter,
				description: style.description,
				data: style.data
			}
		);

		if (e) {
			return fail(response.status, { error: e });
		}

		redirect(307, '/admin/styles');
	}
};
