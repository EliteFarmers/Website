<script lang="ts">
	import type { components } from '$lib/api/api';
	import ProductPrice from './product-price.svelte';
	import Package from 'lucide-svelte/icons/package';

	interface Props {
		product: components['schemas']['ProductDto'];
	}

	let { product }: Props = $props();

	let image = $derived(product.thumbnail?.url ?? '');
</script>

<a
	class="m-1 inline-block max-w-64 rounded-md bg-primary-foreground shadow-primary hover:drop-shadow-lg"
	href="/shop/{product.id}"
>
	<div class="flex min-w-0 flex-col items-center justify-start gap-4">
		<div class="grid min-h-32 w-full items-center justify-center rounded-md drop-shadow-lg">
			{#if image}
				<img src={image} alt={product.name} class="h-32 w-32 rounded-sm object-cover" />
			{:else}
				<Package size={64} />
			{/if}
		</div>
		<div class="flex flex-row justify-between gap-2 px-2 pb-2 pt-1">
			<p class="overflow-hidden text-ellipsis pr-4 text-xl">{product.name}</p>
			<ProductPrice {product} />
		</div>
	</div>
</a>
