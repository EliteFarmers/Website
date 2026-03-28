<script lang="ts">
	import Head from '$comp/head.svelte';
	import RenderMd from '$comp/markdown/render-md.svelte';
	import ProductCard from '$comp/monetization/product-card.svelte';
	import ResponsiveImage from '$comp/responsive-image.svelte';
	import ArtistCredit from '$comp/shop/artist-credit.svelte';
	import { env } from '$env/dynamic/public';
	import { buildShopCategoryLdJson, shopKeywords } from '$lib/shop/seo';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let heroTitle = $derived(data.override?.heroTitle ?? data.category.title);
	let heroDescription = $derived(
		data.override?.heroDescription ??
			data.category.description ??
			'Browse cosmetics, profile upgrades, and supporter perks in this collection.'
	);
	let heroImage = $derived.by(() => {
		if (data.override?.heroImageUrl) return data.override.heroImageUrl;
		const lead = data.category.products?.find((product) => product.thumbnail?.url || product.images?.length);
		return lead?.thumbnail?.url ?? lead?.images?.[0]?.url ?? '/favicon.webp';
	});
	let seoDescription = $derived(
		`${heroDescription} Explore the full ${data.category.title} collection in the Elite Shop.`
	);
	const baseUrl = env.PUBLIC_CANONICAL_URL || env.PUBLIC_HOST_URL || '';
	let ldJson = $derived(buildShopCategoryLdJson(baseUrl, data.category, heroImage, seoDescription));

	let artist = $derived(data.category.assignedArtist);
</script>

<Head
	title={`${heroTitle} | Elite Shop`}
	description={seoDescription}
	keywords={shopKeywords}
	canonicalPath="/shop/category/{data.category.slug}"
	imageUrl={heroImage}
	twitterCardType="summary_large_image"
	{ldJson}
/>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-10 sm:px-6 lg:px-8">
	<section class="overflow-hidden rounded-4xl border shadow-2xl">
		{#if data.category.bannerImage}
			<div class="relative h-48 overflow-hidden sm:h-64 lg:h-80">
				<div class="absolute inset-0 bg-linear-to-t to-transparent"></div>
				<ResponsiveImage
					image={data.category.bannerImage}
					alt={heroTitle}
					loading="eager"
					class="h-full w-full object-cover"
				/>
			</div>
		{:else}
			<div class="relative h-48 overflow-hidden sm:h-64 lg:h-80">
				<div class="absolute inset-0 bg-linear-to-t to-transparent"></div>
				<img src={heroImage} alt={heroTitle} class="h-full w-full object-cover" />
			</div>
		{/if}

		<div class="relative flex flex-col gap-4 p-6 sm:p-8 lg:p-12">
			<div class="bg-primary/20 absolute top-0 left-8 h-28 w-28 -translate-y-1/2 rounded-full blur-3xl"></div>

			<div class="relative space-y-4">
				<h1 class="max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl">
					{heroTitle}
				</h1>
				<p class="max-w-2xl text-sm leading-relaxed sm:text-base">
					{heroDescription}
				</p>
			</div>

			{#if artist}
				<ArtistCredit {artist} prefix="Category by" />
			{/if}

			<div class="relative flex flex-wrap gap-3">
				<a
					href="/shop"
					class="bg-primary text-primary-foreground inline-flex rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm"
					data-sveltekit-preload-data="tap"
				>
					Back to Shop
				</a>
				<a
					href="#products"
					class="bg-background/15 inline-flex rounded-full border px-5 py-2.5 text-sm font-semibold"
				>
					Browse
				</a>
			</div>
		</div>
	</section>

	{#if data.category.longDescription}
		<section class="prose prose-neutral dark:prose-invert max-w-3xl">
			<div class="text-muted-foreground leading-relaxed">
				<RenderMd content={data.category.longDescription} />
			</div>
		</section>
	{/if}

	{#if data.featuredProducts.length}
		<section class="space-y-6">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h2 class="text-3xl font-black tracking-tight sm:text-4xl">
						Favorites from {data.category.title}
					</h2>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
				{#each data.featuredProducts as product (product.id)}
					<ProductCard {product} class="w-full max-w-none" />
				{/each}
			</div>
		</section>
	{/if}

	<section id="products" class="space-y-6">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h2 class="text-3xl font-black tracking-tight sm:text-4xl">
					All {data.category.title}
				</h2>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
			{#each data.category.products ?? [] as product (product.id)}
				<ProductCard {product} class="w-full max-w-none" />
			{/each}
		</div>
	</section>

	{#if data.otherCategories.length}
		<section class="space-y-5">
			<div>
				<h2 class="text-3xl font-black tracking-tight sm:text-4xl">More collections</h2>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				{#each data.otherCategories as category (category.id)}
					<a
						href="/shop/category/{category.slug}"
						class="border-border/60 bg-card hover:bg-card/80 rounded-3xl border p-5 transition-colors"
						data-sveltekit-preload-data="tap"
					>
						<h3 class="text-xl font-bold tracking-tight">{category.title}</h3>
						<p class="text-muted-foreground mt-2 text-sm leading-relaxed">
							{category.description ??
								'Discover another part of the shop with its own mix of cosmetics and perks.'}
						</p>
						<span class="text-primary mt-4 inline-flex items-center gap-2 text-sm font-semibold">
							Explore
							<ArrowRight class="size-4" />
						</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>
