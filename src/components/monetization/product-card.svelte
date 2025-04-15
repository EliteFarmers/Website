<script lang="ts">
	import type { components } from '$lib/api/api';
	import { cn } from '$lib/utils';
	import ProductPrice from './product-price.svelte';
	import Package from '@lucide/svelte/icons/package';

	interface Props {
		product: components['schemas']['ProductDto'];
		class?: string;
	}

	let { product, class: className = '' }: Props = $props();

	let image = $derived(product.thumbnail?.url ?? '');
</script>

<a
	class={cn('inline-block max-w-64 rounded-md bg-card shadow-primary hover:drop-shadow-lg', className)}
	href="/shop/{product.id}"
>
	<div class="flex min-w-0 flex-col items-center justify-start">
		<div class="relative grid min-h-32 w-full items-center justify-center rounded-md drop-shadow-lg">
			{#if image}
				<img src={image} alt={product.name} class="h-32 w-32 rounded-sm object-cover" />
			{:else}
				<Package size={64} />
			{/if}
			<div class="absolute bottom-0 right-0 mb-1 mr-2 rounded-md shadow-card drop-shadow-md">
				<ProductPrice {product} />
			</div>
		</div>
		<div class="flex flex-row items-start justify-center gap-2 p-2 px-1">
			<p class="overflow-hidden text-ellipsis text-xl">{product.name}</p>
		</div>
	</div>
</a>
