import type { ShopCategoryDto } from '$lib/api';
import { previewText, type PreviewCard } from '$lib/discord-preview';

export function createPreview({ category }: { category: ShopCategoryDto }): PreviewCard {
	return {
		title: category.title + ' | Elite Shop',
		description: category.description,
		lines: category.products?.slice(0, 5).map((product) => '**' + previewText(product.name) + '**'),
		links: [{ label: 'Explore collection', path: '/shop/category/' + category.slug }],
	};
}
