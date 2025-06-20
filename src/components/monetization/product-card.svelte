<script lang="ts">
	import type { components } from '$lib/api/api';
	import { cn } from '$lib/utils';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Package from '@lucide/svelte/icons/package';

	interface Props {
		product: components['schemas']['ProductDto'];
		class?: string;
	}

	let { product, class: className = '' }: Props = $props();

	let image = $derived(product.thumbnail?.url ?? '');
	let dollars = $derived(((product.price ?? 0) / 100).toFixed(2));
	let free = $derived(!product.price || +dollars === 0);
</script>

<a
	class={cn('group bg-card shadow-primary inline-block max-w-48 rounded-lg border-2 hover:drop-shadow-lg', className)}
	href="/shop/{product.id}"
>
	<div class="flex min-w-0 flex-col justify-start">
		<div class="relative grid min-h-32 w-full items-center justify-center rounded-md">
			{#if image}
				<img src={image} alt={product.name} class="size-48 rounded-t-md object-cover" />
			{:else}
				<Package size={64} class="m-16" />
			{/if}
		</div>
		<div class="flex flex-col items-start justify-between gap-2 py-2">
			<p class="inline-block max-w-48 flex-1 truncate px-2 text-lg">{product.name}</p>

			<div class="relative w-full px-2 text-sm font-semibold">
				{#if free}
					<span>Free</span>
				{:else}
					<span class="leading-none whitespace-nowrap"
						>{dollars} USD
						{#if product.isSubscription}
							<span class="leading-none whitespace-nowrap">/ Month</span>
						{/if}
					</span>
				{/if}
				<div class="text-muted-foreground group-hover:animate-bounce-horizontal absolute top-0 right-2">
					<ArrowRight size={18} />
				</div>
			</div>
		</div>
	</div>
</a>
