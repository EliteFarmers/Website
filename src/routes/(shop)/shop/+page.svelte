<script lang="ts">
	import Head from '$comp/head.svelte';
	import PremiumBanner from '$comp/monetization/premium-banner.svelte';
	import ProductCard from '$comp/monetization/product-card.svelte';
	import ResponsiveImage from '$comp/responsive-image.svelte';
	import { env } from '$env/dynamic/public';
	import type { ProductDto, ShopCategoryDto } from '$lib/api';
	import { buildShopHomeLdJson, shopKeywords } from '$lib/shop/seo';
	import { getCategoryOverride } from '$lib/shop/storefront';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let categories = $derived.by(() => (data.categories ?? []).filter((category) => category.products?.length));
	let premiumProduct = $derived(data.products.find((product) => product.isSubscription) as ProductDto | undefined);
	let featuredCategories = $derived.by(() => {
		const bySlug = data.storefront.featuredCategorySlugs
			.map((slug) => categories.find((category) => category.slug === slug))
			.filter((category): category is ShopCategoryDto => Boolean(category));

		return bySlug.length ? bySlug : categories.slice(0, 3);
	});
	let featuredProducts = $derived.by(() => {
		const byId = data.storefront.featuredProductIds
			.map((productId) => data.products.find((product) => product.id === productId.toString()))
			.filter((product): product is ProductDto => Boolean(product));

		return byId.length ? byId : data.products.slice(0, 4);
	});
	let heroImage = $derived.by(
		() =>
			premiumProduct?.thumbnail?.url ??
			premiumProduct?.images?.[0]?.url ??
			featuredProducts[0]?.thumbnail?.url ??
			featuredProducts[0]?.images?.[0]?.url ??
			data.products[0]?.thumbnail?.url ??
			data.products[0]?.images?.[0]?.url ??
			'/favicon.webp'
	);
	const baseUrl = env.PUBLIC_CANONICAL_URL || env.PUBLIC_HOST_URL || '';
	const seoDescription =
		'Shop profile cosmetics, badges, custom styles, and premium perks built for the Elite Skyblock community.';
	let ldJson = $derived(buildShopHomeLdJson(baseUrl, heroImage, data.products));
</script>

<Head
	title="Elite Shop | Cosmetics, Badges, and Premium Perks"
	description={seoDescription}
	keywords={shopKeywords}
	imageUrl={heroImage}
	twitterCardType="summary_large_image"
	{ldJson}
/>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-10 sm:px-6 lg:px-8">
	<section class="max-w-4xl space-y-3">
		<h1 class="max-w-3xl text-4xl font-black tracking-tight text-balance sm:text-5xl lg:text-6xl">
			The Elite Shop
		</h1>
		<p class="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
			Check out cosmetics and premium perks for your Elite Skyblock profile!
		</p>
	</section>

	{#if premiumProduct}
		<section class="space-y-5">
			<PremiumBanner product={premiumProduct} class="w-full max-w-none" />
		</section>
	{/if}

	<section id="collections" class="space-y-6">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h2 class="text-3xl font-black tracking-tight sm:text-4xl">Collections</h2>
			</div>
		</div>

		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each featuredCategories as category (category.id)}
				{@const override = getCategoryOverride(data.storefront, category.slug)}
				{@const leadProduct =
					category.products?.find((product) => product.thumbnail?.url || product.images?.length) ??
					category.products?.[0]}
				<a
					href="/shop/category/{category.slug}"
					class="group border-border/60 bg-card relative overflow-hidden rounded-[1.75rem] border shadow-sm transition-transform duration-300 hover:-translate-y-1"
					data-sveltekit-preload-data="tap"
				>
					<div class="aspect-video overflow-hidden">
						{#if category.bannerImage}
							<ResponsiveImage
								image={category.bannerImage}
								alt={override?.heroTitle ?? category.title}
								loading="lazy"
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
						{:else}
							<img
								src={override?.heroImageUrl ??
									leadProduct?.thumbnail?.url ??
									leadProduct?.images?.[0]?.url ??
									'/favicon.webp'}
								alt={override?.heroTitle ?? category.title}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
						{/if}
					</div>
					<div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"></div>
					<div class="absolute inset-0 flex flex-col justify-end gap-2 p-5 text-white">
						<h3 class="text-xl font-black tracking-tight">{override?.heroTitle ?? category.title}</h3>
						<span class="inline-flex items-center gap-2 text-sm font-semibold text-white/80">
							Browse
							<ArrowRight class="size-4" />
						</span>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<section class="space-y-6">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h2 class="text-3xl font-black tracking-tight sm:text-4xl">Featured</h2>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
			{#each featuredProducts as product (product.id)}
				<ProductCard {product} class="w-full max-w-none" />
			{/each}
		</div>
	</section>

	<div class="flex flex-col gap-12">
		{#each categories as category (category.id)}
			<section class="space-y-6">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 class="text-3xl font-black tracking-tight">{category.title}</h2>
						{#if category.description}
							<p class="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
								{category.description}
							</p>
						{/if}
					</div>

					<a
						href="/shop/category/{category.slug}"
						class="text-primary inline-flex items-center gap-2 text-sm font-semibold"
						data-sveltekit-preload-data="tap"
					>
						View collection
						<ArrowRight class="size-4" />
					</a>
				</div>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
					{#each (category.products ?? []).slice(0, 4) as product (product.id)}
						<ProductCard {product} class="w-full max-w-none" />
					{/each}
				</div>
			</section>
		{/each}
	</div>

	<section class="space-y-6">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h2 class="text-3xl font-black tracking-tight sm:text-4xl">Everything in the shop</h2>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
			{#each data.products as product (product.id)}
				<ProductCard {product} class="w-full max-w-none" />
			{/each}
		</div>
	</section>
</div>
