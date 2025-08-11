import { claimProduct } from '$lib/api';
import { getSelectedMember } from '$lib/remote';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params, parent }) => {
	const { products, session } = await parent();

	const product = products?.find((p) => p.id === params.sku);

	if (!product) {
		error(404, 'Product Not Found');
	}

	if (!session?.uuid) {
		return {
			product: product,
		};
	}

	const { data: weight } = await getSelectedMember({ playerUuid: session.uuid });

	return {
		product: product,
		uuid: session.uuid,
		ign: session.ign,
		weight: weight?.farmingWeight,
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	claim: async ({ request, locals }) => {
		if (!locals.session?.id || !locals.access_token) {
			throw error(401, 'Unauthorized');
		}
		const data = await request.formData();
		const sku = data.get('sku') as string;
		if (!sku) {
			return { error: 'Invalid SKU.' };
		}

		const { response, error: e } = await claimProduct(BigInt(+sku));
		if (!response.ok) {
			return fail(500, { error: e || 'Failed to claim item!' });
		}

		redirect(303, '/profile/settings');
	},
};
