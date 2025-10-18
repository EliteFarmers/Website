import {
	addStyleImage,
	createStyle,
	deleteStyle,
	deleteStyleImage,
	getStyle,
	updateStyle,
	type WeightStyleWithDataDto,
} from '$lib/api';
import { isValidLeaderboardStyle, isValidWeightStyle } from '$lib/styles/style';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, params }) => {
	const { access_token: token, session } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: style } = await getStyle(params.styleId).catch(() => ({ data: undefined }));

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

		const body: WeightStyleWithDataDto = {
			id: +styleId,
			name: (data.get('name') as string) || undefined,
			styleFormatter: (data.get('formatter') as string) || undefined,
			description: (data.get('description') as string) || undefined,
			images: [],
			products: [],
		};

		const style = data.get('data') as string | undefined;
		if (style) {
			const styleData = JSON.parse(data.get('data') as string);

			if (!isValidWeightStyle(styleData)) {
				return fail(400, { error: 'Invalid style data.' });
			}

			body.data = styleData as WeightStyleWithDataDto['data'];
		}

		const { error: e, response } = await updateStyle(styleId, body);

		if (e) {
			return fail(response.status, { error: e });
		}

		return { success: true };
	},
	updateLeaderboardStyle: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const styleId = data.get('style') as string;

		if (!styleId || isNaN(+styleId)) {
			return fail(400, { error: 'Invalid style ID.' });
		}

		const body: WeightStyleWithDataDto = {
			id: +styleId,
			name: (data.get('name') as string) || undefined,
			styleFormatter: (data.get('formatter') as string) || undefined,
			description: (data.get('description') as string) || undefined,
			images: [],
			products: [],
		};

		const style = data.get('data') as string | undefined;
		if (style) {
			const styleData = JSON.parse(data.get('data') as string);

			if (!isValidLeaderboardStyle(styleData)) {
				return fail(400, { error: 'Invalid style data.' });
			}

			body.leaderboard = styleData as WeightStyleWithDataDto['leaderboard'];
		}

		const { error: e, response } = await updateStyle(styleId, body);

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

		const { error: e } = await deleteStyle(styleId);

		if (e) {
			return fail(400, { error: e });
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

		const { data: style } = await getStyle(styleId).catch(() => ({ data: undefined }));

		if (!style) {
			return fail(404, { error: 'Style not found.' });
		}

		const { error: e, response } = await createStyle({
			name: style.name + ' (Copy)',
			styleFormatter: style.styleFormatter,
			description: style.description,
			data: style.data ?? { elements: { background: { fill: '#ffffff' } } },
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

		const image = data.get('image') as Blob;
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const thumbnail = data.get('thumbnail') === 'true';

		if (!image) {
			return fail(400, { error: 'Invalid image data.' });
		}

		const { response, error: e } = await addStyleImage(
			styleId,
			{
				image: image,
				title: title,
				description: description,
			},
			{ thumbnail }
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

		const { response, error: e } = await deleteStyleImage(productId, image);

		if (!response.ok || e) {
			return fail(response.status, { error: e });
		}

		return { success: true };
	},
};
