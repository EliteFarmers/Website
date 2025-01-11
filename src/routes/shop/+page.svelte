<script lang="ts">
	import Head from '$comp/head.svelte';
	import ProductCard from '$comp/monetization/product-card.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let categories = $derived((data.categories ?? []).filter((c) => c.products?.length));
</script>

<Head title="Shop" description="Help support development with cosmetics!" />

<div class="mx-2 my-16 flex flex-col items-center gap-12">
	<section class="flex max-w-4xl flex-col items-start gap-4">
		<h1 class="mb-4 text-4xl">Elite Shop</h1>
		<p class="max-w-2xl">
			Welcome to the Elite Shop! Here you can purchase and preview cosmetics to show off your support for the
			Elite projects!
		</p>
		<p class="max-w-2xl text-sm">
			All purchases are made through the Discord store, not directly on the website. You can preview all products
			here before purchasing them in the store.
		</p>
		<!-- {#if data.styles?.[0]}
            <WeightStyle style={data.styles?.[0]} />
        {/if} -->
	</section>

	{#each categories as category (category.id)}
		<section class="flex max-w-4xl flex-col items-start gap-4">
			<h2 class="text-2xl">{category.title}</h2>
			<div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
				{#each category.products ?? [] as product (product.id)}
					<ProductCard {product} />
				{/each}
			</div>
		</section>
	{/each}

	<section class="flex max-w-4xl flex-col items-start gap-4">
		<h2 class="text-2xl">All Products</h2>
		<div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
			{#each data.products as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	</section>
</div>
