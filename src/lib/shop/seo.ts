import type { ProductDto, ShopCategoryDto } from '$lib/api';

type BreadcrumbItem = {
	name: string;
	path: string;
};

const defaultShopDescription = 'Shop profile cosmetics, badges, custom styles, and premium perks for Elite Skyblock.';

function toAbsoluteUrl(baseUrl: string, path?: string | null) {
	if (!path) {
		return undefined;
	}

	if (path.startsWith('http://') || path.startsWith('https://')) {
		return path;
	}

	if (!baseUrl) {
		return path;
	}

	return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

function buildBreadcrumbList(baseUrl: string, items: BreadcrumbItem[]) {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: toAbsoluteUrl(baseUrl, item.path),
		})),
	};
}

function buildItemList(baseUrl: string, products: ProductDto[]) {
	return {
		'@type': 'ItemList',
		itemListElement: products.map((product, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			url: toAbsoluteUrl(baseUrl, `/shop/${product.id}`),
			name: product.name,
		})),
	};
}

function getProductDescription(product: ProductDto, fallback?: string) {
	return product.description?.trim() || fallback || defaultShopDescription;
}

export const shopKeywords = [
	'elite shop',
	'elite skyblock shop',
	'skyblock cosmetics',
	'profile badges',
	'profile styles',
	'elite premium',
].join(', ');

export function buildShopHomeLdJson(baseUrl: string, heroImage: string, products: ProductDto[]) {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			buildBreadcrumbList(baseUrl, [{ name: 'Shop', path: '/shop' }]),
			{
				'@type': 'CollectionPage',
				name: 'Elite Shop',
				description: defaultShopDescription,
				url: toAbsoluteUrl(baseUrl, '/shop'),
				image: toAbsoluteUrl(baseUrl, heroImage),
				mainEntity: buildItemList(baseUrl, products.slice(0, 12)),
			},
		],
	};
}

export function buildShopCategoryLdJson(
	baseUrl: string,
	category: ShopCategoryDto,
	heroImage: string,
	description: string
) {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			buildBreadcrumbList(baseUrl, [
				{ name: 'Shop', path: '/shop' },
				{ name: category.title, path: `/shop/category/${category.slug}` },
			]),
			{
				'@type': 'CollectionPage',
				name: `${category.title} | Elite Shop`,
				description,
				url: toAbsoluteUrl(baseUrl, `/shop/category/${category.slug}`),
				image: toAbsoluteUrl(baseUrl, heroImage),
				mainEntity: buildItemList(baseUrl, category.products ?? []),
			},
		],
	};
}

export function buildShopProductLdJson(
	baseUrl: string,
	product: ProductDto,
	productCategories: ShopCategoryDto[],
	description: string
) {
	const imageUrls = [product.thumbnail?.url, ...(product.images ?? []).map((image) => image.url)]
		.filter((image): image is string => Boolean(image))
		.map((image) => toAbsoluteUrl(baseUrl, image));

	return {
		'@context': 'https://schema.org',
		'@graph': [
			buildBreadcrumbList(baseUrl, [
				{ name: 'Shop', path: '/shop' },
				...productCategories.slice(0, 1).map((category) => ({
					name: category.title,
					path: `/shop/category/${category.slug}`,
				})),
				{ name: product.name, path: `/shop/${product.id}` },
			]),
			{
				'@type': 'Product',
				name: product.name,
				description: getProductDescription(product, description),
				sku: product.id,
				category: productCategories.map((category) => category.title).join(', ') || undefined,
				image: imageUrls.length ? imageUrls : undefined,
				brand: {
					'@type': 'Brand',
					name: 'Elite',
				},
				offers: {
					'@type': 'Offer',
					priceCurrency: 'USD',
					price: ((product.price ?? 0) / 100).toFixed(2),
					availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
					url: toAbsoluteUrl(baseUrl, `/shop/${product.id}`),
				},
			},
		],
	};
}

export function buildShopCheckoutLdJson(baseUrl: string) {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			buildBreadcrumbList(baseUrl, [
				{ name: 'Shop', path: '/shop' },
				{ name: 'Checkout', path: '/shop/checkout' },
			]),
			{
				'@type': 'WebPage',
				name: 'Elite Shop Checkout',
				description: 'Review your Elite Shop basket, confirm the recipient, and continue to checkout.',
				url: toAbsoluteUrl(baseUrl, '/shop/checkout'),
			},
		],
	};
}
