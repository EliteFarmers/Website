import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GetSelectedProfileMember } from '$lib/api/elite';

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

	const { data: weight } = await GetSelectedProfileMember(session.uuid).catch(() => ({ data: undefined }));

	return {
		product: product,
		uuid: session.uuid,
		ign: session.ign,
		weight: weight?.farmingWeight,
	};
}) satisfies PageServerLoad;
