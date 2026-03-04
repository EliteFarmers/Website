<script lang="ts">
	import Head from '$comp/head.svelte';
	import PremiumBanner from '$comp/monetization/premium-banner.svelte';
	import ProductCard from '$comp/monetization/product-card.svelte';
	import type { ProductDto } from '$lib/api';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let categories = $derived((data.categories ?? []).filter((c) => c.products?.length));
	let premiumProduct = $derived(data.products.find((p) => p.isSubscription) as ProductDto | undefined);
</script>

<Head title="Shop" description="Help support development with cosmetics!" />

<div class="container mx-auto flex flex-col gap-16 px-4 py-16">
	<section class="flex flex-col items-center text-center">
		<h1 class="mb-4 text-5xl font-extrabold tracking-tight lg:text-6xl">Elite Shop</h1>
		<p class="text-muted-foreground max-w-2xl text-lg">
			Customize your experience with exclusive cosmetics and features. Support development and show off your
			style!
		</p>
	</section>

	{#if premiumProduct}
		<section class="flex justify-center">
			<PremiumBanner product={premiumProduct} class="w-full" />
		</section>
	{/if}

	<div class="flex flex-col gap-12">
		{#each categories as category (category.id)}
			<section class="flex flex-col gap-6">
				<div class="flex items-center justify-between border-b pb-4">
					<h2 class="text-3xl font-bold tracking-tight">{category.title}</h2>
				</div>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each category.products ?? [] as product (product.id)}
						<ProductCard {product} class="w-full max-w-none" />
					{/each}
				</div>
			</section>
		{/each}

		<section class="flex flex-col gap-6">
			<div class="flex items-center justify-between border-b pb-4">
				<h2 class="text-3xl font-bold tracking-tight">All Products</h2>
			</div>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each data.products as product (product.id)}
					<ProductCard {product} class="w-full max-w-none" />
				{/each}
			</div>
		</section>
	</div>
</div>
