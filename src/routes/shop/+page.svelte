<script lang="ts">
	import Head from '$comp/head.svelte';
	import ProductCard from '$comp/monetization/product-card.svelte';
	import WeightStyle from '$comp/monetization/weight-style.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Head title="Shop" description="Help support development with cosmetics!" />

<main class="flex flex-col justify-start gap-12 my-16 mx-2">
	<section class="flex flex-col items-start gap-4">
		<h1 class="text-3xl mb-4">Elite Shop</h1>
		<p class="max-w-2xl text-sm">
			Welcome to the Elite Shop! Here you can purchase and preview cosmetics to show off your support for the
			Elite projects!
		</p>
		<!-- {#if data.styles?.[0]}
            <WeightStyle style={data.styles?.[0]} />
        {/if} -->
	</section>

	<section class="flex flex-col items-start gap-4">
		<h2 class="text-2xl">All Products</h2>
		<div class="grid grid-cols-3">
			{#each data.products as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	</section>
</main>
