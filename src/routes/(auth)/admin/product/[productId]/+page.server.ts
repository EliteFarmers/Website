import {
	addCosmeticToProduct,
	addProductImage,
	deleteProductImage,
	getAllProducts,
	removeCosmeticToProduct,
	updateProduct,
	type EditProductDto,
} from '$lib/api';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent, locals, params }) => {
	const { user, session } = await parent();
	const { access_token: token } = locals;

	if (!session || !session.flags.moderator || !token) {
		throw error(404, 'Not Found');
	}

	const { data: products = [] } = await getAllProducts().catch(() => ({ data: undefined }));

	const product = products.find((p) => p.id === params.productId);

	if (!product) {
		throw error(404, 'Product Not Found');
	}

	return {
		user,
		product,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	updateProduct: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const productId = data.get('product') as string;

		if (!productId) {
			return fail(400, { error: 'Invalid product ID.' });
		}

		const badgeId = data.get('badge') as string | undefined;

		const body = {
			description: (data.get('description') as string) || undefined,
			price: (data.get('price') as unknown as number) || undefined,
			available: data.get('available') === 'true',
			features: {
				badgeId: badgeId ? +badgeId : undefined,
				hideShopPromotions: data.get('promotions') === 'true',
				weightStyleOverride: data.get('override') === 'true',
				moreInfoDefault: data.get('info') === 'true',
				embedColors: (data.getAll('color') as string[])?.filter((c) => c) ?? undefined,
				customEmoji: data.get('emoji') === 'true',
			},
		} satisfies EditProductDto;

		const { response, error: e } = await updateProduct(productId, body);

		if (!response.ok || e) {
			console.log(e);
			return fail(response.status, { error: e ?? 'Failed to update product!' });
		}

		return { success: true };
	},
	addImage: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const productId = data.get('product') as string;

		if (!productId) {
			return fail(400, { error: 'Invalid product ID.' });
		}

		const image = data.get('image') as Blob;
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const thumbnail = data.get('thumbnail') === 'true';

		if (!image) {
			return fail(400, { error: 'Invalid image data.' });
		}

		const { response, error: e } = await addProductImage(
			productId,
			{
				image: image,
				title: title,
				description: description,
			},
			{ thumbnail }
		);

		if (!response.ok || e) {
			console.log(e);
			return fail(response.status, { error: e ?? 'Failed to add image!' });
		}

		return { success: true };
	},
	deleteImage: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const productId = data.get('product') as string;

		if (!productId) {
			return fail(400, { error: 'Invalid product ID.' });
		}

		const image = data.get('image') as string;

		if (!image) {
			return fail(400, { error: 'Invalid image data.' });
		}

		const { response, error: e } = await deleteProductImage(productId, image);

		if (!response.ok || e) {
			return fail(response.status, { error: e ?? 'Failed to delete image!' });
		}

		return { success: true };
	},
	addCosmetic: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const productId = data.get('product') as string;
		const cosmeticId = data.get('cosmetic') as string;

		if (!productId || !cosmeticId) {
			return fail(400, { error: 'Invalid product Id or cosmetic.' });
		}

		const { response, error: e } = await addCosmeticToProduct(productId, cosmeticId);

		if (!response.ok || e) {
			console.log(e);
			return fail(response.status, { error: e ?? 'Failed to add cosmetic!' });
		}

		return { success: true };
	},
	removeCosmetic: async ({ locals, request }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();
		const productId = data.get('product') as string;
		const cosmeticId = data.get('cosmetic') as string;

		if (!productId || !cosmeticId) {
			return fail(400, { error: 'Invalid product Id or cosmetic.' });
		}

		const { response, error: e } = await removeCosmeticToProduct(productId, cosmeticId);

		if (!response.ok || e) {
			console.log(e);
			return fail(response.status, { error: e ?? 'Failed to remove cosmetic!' });
		}

		return { success: true };
	},
};
