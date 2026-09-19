import type { ProductDto } from '$lib/api';
import type { PreviewCard } from '$lib/discord-preview';

export function createPreview({ product }: { product: ProductDto }): PreviewCard {
	return {
		title: product.name,
		description: product.description,
		image: product.thumbnail?.url,
		lines: [
			'**$' + (product.price / 100).toFixed(2) + ' USD**' + (product.isSubscription ? ' • Subscription' : ''),
			product.available ? 'Available in the Elite Shop' : 'Currently unavailable',
		],
		links: [
			{ label: 'View product', path: '/shop/' + product.id },
			{ label: 'Browse shop', path: '/shop' },
		],
	};
}
