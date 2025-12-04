<script lang="ts">
	import type { ProductDto } from '$lib/api';
	import { cn } from '$lib/utils';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Package from '@lucide/svelte/icons/package';

	interface Props {
		product: ProductDto;
		class?: string;
	}

	let { product, class: className = '' }: Props = $props();

	let image = $derived(product.thumbnail?.url ?? '');
	let dollars = $derived(((product.price ?? 0) / 100).toFixed(2));
	let free = $derived(!product.price || +dollars === 0);
</script>

<a
	class={cn(
		'group bg-card hover:bg-accent/50 border-border relative flex w-full max-w-[280px] flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
		className
	)}
	href="/shop/{product.id}"
	data-sveltekit-preload-data="tap"
>
	<div class="bg-muted/30 relative flex aspect-video w-full items-center justify-center overflow-hidden">
		{#if image}
			<img
				src={image}
				alt={product.name}
				class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
			/>
		{:else}
			<Package size={48} class="text-muted-foreground/50" />
		{/if}
	</div>

	<div class="flex flex-1 flex-col p-4">
		<h3 class="line-clamp-1 text-lg font-bold tracking-tight">{product.name}</h3>

		{#if product.description}
			<p class="text-muted-foreground mt-1 line-clamp-2 text-sm">
				{product.description}
			</p>
		{/if}

		<div class="mt-auto flex items-center justify-between pt-4">
			<div class="flex flex-col">
				{#if free}
					<span class="text-lg font-bold">Free</span>
				{:else}
					<div class="flex items-baseline gap-1">
						<span class="text-lg font-bold">${dollars}</span>
						{#if product.isSubscription}
							<span class="text-muted-foreground text-xs">/mo</span>
						{/if}
					</div>
				{/if}
			</div>

			<div
				class="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full transition-colors"
			>
				<ArrowRight size={16} />
			</div>
		</div>
	</div>
</a>
