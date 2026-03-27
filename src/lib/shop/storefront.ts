import type { ProductDto, ShopCategoryDto } from '$lib/api';

export type ShopStorefrontResponse = {
	featuredCategorySlugs: string[];
	featuredProductIds: number[];
	valueProps: ShopValueProp[];
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

export function getPlaceholderShopStorefront({ products, categories }: StorefrontInput): ShopStorefrontResponse {
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
		valueProps: [
			{
				id: 'cosmetics',
				title: 'Exclusive Cosmetics',
				description: 'Profile styles, badges, and flair visible across the website and bot.',
				icon: 'palette',
			},
			{
				id: 'account-sync',
				title: 'Account-Synced',
				description: 'Purchases stay on your Elite account and follow you everywhere.',
				icon: 'shield',
			},
			{
				id: 'hassle-free',
				title: 'Hassle-Free Checkout',
				description: 'Add items to your basket and check out in seconds through Tebex — quick, secure, done.',
				icon: 'gift',
			},
			{
				id: 'collector-upgrades',
				title: 'Built For Collectors',
				description: 'Mix and match badges, styles, and premium perks to build your look.',
				icon: 'sparkles',
			},
		],
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
				description: 'Review active checkouts, gifts, and recurring purchases in one place.',
				href: '/profile/purchases',
			},
			{
				id: 'home',
				label: 'Back To Elite',
				description:
					'Jump back into stats, tools, and the rest of the main website when you are done browsing.',
				href: '/',
			},
		],
		categoryOverrides: buildCategoryOverrides(categories),
	};
}

export function getCategoryOverride(storefront: ShopStorefrontResponse, categorySlug: string) {
	return storefront.categoryOverrides.find((override) => override.categorySlug === categorySlug);
}
