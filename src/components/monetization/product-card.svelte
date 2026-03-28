<script lang="ts">
	import type { ProductDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { cn } from '$lib/utils';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Gift from '@lucide/svelte/icons/gift';
	import Package from '@lucide/svelte/icons/package';

	interface Props {
		product: ProductDto;
		class?: string;
	}

	let { product, class: className = '' }: Props = $props();

	const globalContext = getGlobalContext();
	const image = $derived(product.thumbnail?.url ?? '');
	const dollars = $derived(((product.price ?? 0) / 100).toFixed(2));
	const free = $derived(!product.price || +dollars === 0);
	const isOwned = $derived.by(() => globalContext.authorized && globalContext.ownsProduct(product.id));
	const isNew = $derived(
		product.releasedAt ? new Date(product.releasedAt).getTime() > Date.now() - 1000 * 60 * 60 * 24 * 7 : false
	);
</script>

<a
	class={cn(
		'group bg-card hover:bg-accent/50 border-border relative flex w-full max-w-70 flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
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
			<Package size={48} class="text-muted-foreground opacity-50" />
		{/if}
		{#if isOwned}
			<span
				class="bg-primary shadow-primary/30 text-primary-foreground absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-semibold shadow-md"
			>
				Owned
			</span>
		{/if}
		{#if isNew}
			<span
				class="bg-destructive shadow-destructive/50 text-destructive-foreground absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-semibold shadow-md"
				>NEW</span
			>
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
				{#if isOwned}
					<Gift size={16} />
				{:else}
					<ArrowRight size={16} />
				{/if}
			</div>
		</div>
	</div>
</a>
