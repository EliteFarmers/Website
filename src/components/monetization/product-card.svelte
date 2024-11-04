<script lang="ts">
	import type { components } from '$lib/api/api';
	import ProductPrice from './product-price.svelte';
	import Package from 'lucide-svelte/icons/package';

	export let product: components['schemas']['ProductDto'];

	$: image = product.thumbnail?.url ?? '';
</script>

<a
	class="m-1 max-w-64 inline-block bg-primary-foreground rounded-md hover:drop-shadow-lg shadow-primary"
	href="/shop/{product.id}"
>
	<div class="flex flex-col min-w-0 justify-start items-center gap-4">
		<div class="grid min-h-32 drop-shadow-lg w-full rounded-md items-center justify-center">
			{#if image}
				<img src={image} alt={product.name} class="w-32 h-32 rounded-sm object-cover" />
			{:else}
				<Package size={64} />
			{/if}
		</div>
		<div class="flex flex-row gap-2 justify-between pb-2 pt-1 px-2">
			<p class="text-xl overflow-hidden text-ellipsis pr-4">{product.name}</p>
			<ProductPrice {product} />
		</div>
	</div>
</a>
