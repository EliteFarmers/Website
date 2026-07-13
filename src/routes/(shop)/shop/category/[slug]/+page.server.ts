import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, parent }) => {
	const data = await parent();
	const categories = data.categories ?? [];
	const products = data.products ?? [];
	const category = categories.find((entry) => entry.slug === params.slug);

	if (!category) {
		error(404, 'Category Not Found');
	}

	const override = data.storefront.categoryOverrides.find((entry) => entry.categorySlug === category.slug);
	const featuredProducts =
		(override?.featuredProductIds?.length
			? override.featuredProductIds
					.map((productId) => products.find((product) => product.id === productId.toString()))
					.filter((product): product is (typeof products)[number] => Boolean(product))
			: category.products?.slice(0, 3)) ?? [];

	const otherCategories = categories
		.filter((entry) => entry.id !== category.id && entry.products?.length)
		.slice(0, 3);

	return {
		category,
		override,
		featuredProducts,
		otherCategories,
	};
}) satisfies PageServerLoad;
