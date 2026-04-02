import type { ProductDto, ShopCategoryDto } from '$lib/api';

export type ShopStorefrontResponse = {
	featuredCategorySlugs: string[];
	featuredProductIds: number[];
	exitLinks: ShopExitLink[];
	categoryOverrides: ShopCategoryOverride[];
};

export type ShopValueProp = {
	id: string;
	title: string;
	description: string;
	icon: 'palette' | 'badge' | 'sparkles' | 'gift' | 'shield';
};

export type ShopExitLink = {
	id: string;
	label: string;
	description?: string;
	href: string;
};

export type ShopCategoryOverride = {
	categorySlug: string;
	eyebrow?: string;
	heroTitle?: string;
	heroDescription?: string;
	heroImageUrl?: string | null;
	featuredProductIds?: number[];
};

type StorefrontInput = {
	products: ProductDto[];
	categories: ShopCategoryDto[];
};

function toProductNumberId(productId?: string | null) {
	const numericId = Number(productId ?? '');
	return Number.isFinite(numericId) ? numericId : null;
}

function getProductMedia(product?: ProductDto | null) {
	return product?.thumbnail?.url ?? product?.images?.[0]?.url ?? '/favicon.webp';
}

function getPopulatedCategories(categories: ShopCategoryDto[]) {
	return categories.filter((category) => category.products?.length);
}

function getNewestProducts(products: ProductDto[]) {
	return [...products]
		.filter((product) => product.releasedAt)
		.sort((a, b) => {
			const aDate = new Date(a.releasedAt ?? 0).getTime();
			const bDate = new Date(b.releasedAt ?? 0).getTime();
			return bDate - aDate;
		});
}

function getCategoryLeadProduct(category?: ShopCategoryDto | null) {
	return (
		category?.products?.find((product) => product.thumbnail?.url || product.images?.length) ??
		category?.products?.[0]
	);
}

function uniqueNumberIds(ids: Array<number | null | undefined>) {
	return [...new Set(ids.filter((id): id is number => id !== null && id !== undefined))];
}

function buildCategoryOverrides(categories: ShopCategoryDto[]) {
	return getPopulatedCategories(categories)
		.slice(0, 4)
		.map((category) => {
			const featuredProductIds = uniqueNumberIds(
				(category.products ?? []).slice(0, 3).map((product) => toProductNumberId(product.id))
			);

			return {
				categorySlug: category.slug,
				eyebrow: 'Curated Collection',
				heroTitle: category.title,
				heroDescription: category.description ?? 'Browse cosmetics and account perks in this collection.',
				heroImageUrl: getProductMedia(getCategoryLeadProduct(category)),
				featuredProductIds,
			} satisfies ShopCategoryOverride;
		});
}

// Eventually should be backed by the API.
export function getShopStorefront({ products, categories }: StorefrontInput): ShopStorefrontResponse {
	const populatedCategories = getPopulatedCategories(categories);
	const premiumProduct = products.find((product) => product.isSubscription);
	const newestProducts = getNewestProducts(products);
	const featuredCategorySlugs = populatedCategories.slice(0, 3).map((category) => category.slug);
	const featuredProductIds = uniqueNumberIds([
		toProductNumberId(premiumProduct?.id),
		...newestProducts.slice(0, 3).map((product) => toProductNumberId(product.id)),
		...populatedCategories
			.slice(0, 2)
			.flatMap((category) =>
				(category.products ?? []).slice(0, 1).map((product) => toProductNumberId(product.id))
			),
	]);

	return {
		featuredCategorySlugs,
		featuredProductIds,
		exitLinks: [
			{
				id: 'settings',
				label: 'Profile Settings',
				description: 'Equip styles, badges, and other unlocked cosmetics on your account.',
				href: '/profile/settings',
			},
			{
				id: 'payments',
				label: 'Purchase History',
				description: 'Review your past purchases and manage subscriptions',
				href: '/profile/purchases',
			},
			{
				id: 'home',
				label: 'Back To Elite Skyblock',
				href: '/',
			},
		],
		categoryOverrides: buildCategoryOverrides(categories),
	};
}

export function getCategoryOverride(storefront: ShopStorefrontResponse, categorySlug: string) {
	return storefront.categoryOverrides.find((override) => override.categorySlug === categorySlug);
}
