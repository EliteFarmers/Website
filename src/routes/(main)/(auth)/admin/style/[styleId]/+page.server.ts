import {
	addStyleImage,
	createStyle,
	deleteStyle,
	deleteStyleImage,
	getStyle,
	reassignStyle,
	updateStyle,
	type WeightStyleWithDataDto,
} from '$lib/api';
import { isValidLeaderboardStyle, isValidWeightStyle } from '$lib/styles/style';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, params }) => {
	const { access_token: token, session } = locals;

	if (!session || !session.perms.artist || !token) {
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

		const body: Omit<WeightStyleWithDataDto, 'imageRefs'> = {
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

		const { error: e, response } = await updateStyle(styleId, body as WeightStyleWithDataDto);

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

		const body: Omit<WeightStyleWithDataDto, 'imageRefs'> = {
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

		const { error: e, response } = await updateStyle(styleId, body as WeightStyleWithDataDto);

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
		const imageUrl = URL.parse(image);
		if (!image || !imageUrl?.pathname) {
			return fail(400, { error: 'Invalid image data.' });
		}

		const { response, error: e } = await deleteStyleImage(productId, encodeURIComponent(imageUrl.pathname));

		if (!response.ok || e) {
			return fail(response.status, { error: e });
		}

		return { success: true };
	},
	reassignStyle: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const styleId = data.get('style') as string;
		const accountId = data.get('accountId') as string;

		if (!styleId || isNaN(+styleId)) {
			return fail(400, { error: 'Invalid style ID.' });
		}

		if (!accountId) {
			return fail(400, { error: 'Invalid account ID.' });
		}

		const { response, error: e } = await reassignStyle(styleId, accountId);

		if (e || !response.ok) {
			return fail(response.status ?? 400, { error: e || 'Failed to reassign style.' });
		}

		return { success: true };
	},
	reuploadImage: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const styleId = data.get('style') as string;
		const imageUrl = data.get('imageUrl') as string;
		const title = data.get('title') as string | null;
		const description = data.get('description') as string | null;

		if (!styleId || isNaN(+styleId)) {
			return fail(400, { error: 'Invalid style ID.' });
		}

		const parsedUrl = URL.parse(imageUrl);
		if (!imageUrl || !parsedUrl?.pathname) {
			return fail(400, { error: 'Invalid image URL.' });
		}

		// Download the existing image
		const imageResponse = await fetch(imageUrl);
		if (!imageResponse.ok) {
			return fail(400, { error: 'Failed to download existing image.' });
		}

		const imageBlob = await imageResponse.blob();

		// Upload the image with original title/description
		const { response: uploadResponse, error: uploadError } = await addStyleImage(styleId, {
			image: imageBlob,
			title: title || undefined,
			description: description || undefined,
		});

		if (!uploadResponse.ok || uploadError) {
			return fail(uploadResponse.status, { error: uploadError || 'Failed to upload image.' });
		}

		return { success: true };
	},
};
