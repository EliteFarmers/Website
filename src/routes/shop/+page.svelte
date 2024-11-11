<script lang="ts">
	import Head from '$comp/head.svelte';
	import ProductCard from '$comp/monetization/product-card.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<Head title="Shop" description="Help support development with cosmetics!" />

<main class="flex flex-col items-center gap-12 my-16 mx-2">
	<section class="flex flex-col items-start gap-4 max-w-4xl">
		<h1 class="text-4xl mb-4">Elite Shop</h1>
		<p class="max-w-2xl">
			Welcome to the Elite Shop! Here you can purchase and preview cosmetics to show off your support for the
			Elite projects!
		</p>
		<p class="text-sm max-w-2xl">
			All purchases are made through the Discord store, not directly on the website. You can preview all products
			here before purchasing them in the store.
		</p>
		<!-- {#if data.styles?.[0]}
            <WeightStyle style={data.styles?.[0]} />
        {/if} -->
	</section>

	<section class="flex flex-col items-start gap-4 max-w-4xl">
		<h2 class="text-2xl">All Products</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			{#each data.products as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	</section>
</main>
