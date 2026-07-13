<script lang="ts">
	import type { ProductDto } from '$lib/api';
	import Package from '@lucide/svelte/icons/package';
	import X from '@lucide/svelte/icons/x';

	interface Props {
		product: ProductDto | null | undefined;
		productAction: 'adding' | 'removing' | null;
		canRemove: boolean;
		onremove: () => void;
		compact?: boolean;
		pending?: boolean;
		pendingLabel?: string;
		description?: string;
	}

	let {
		product,
		productAction,
		canRemove,
		onremove,
		compact = false,
		pending = false,
		pendingLabel,
		description,
	}: Props = $props();

	const image = $derived(product?.thumbnail?.url ?? product?.images?.[0]?.url);
	const price = $derived(product && product.price > 0 ? `$${(product.price / 100).toFixed(2)}` : 'Free');
</script>

<div
	class={pending
		? 'border-primary/30 bg-primary/5 flex items-center gap-3 rounded-2xl border border-dashed p-3'
		: compact
			? 'border-border bg-card flex items-center gap-3 rounded-lg border p-3'
			: 'border-border bg-background/70 flex items-center gap-4 rounded-2xl border p-4'}
>
	{#if image}
		<img
			src={image}
			alt={product?.name ?? 'Product'}
			class={compact
				? 'size-14 shrink-0 rounded-md object-cover'
				: 'size-14 shrink-0 rounded-xl object-cover sm:size-18'}
		/>
	{:else}
		<div
			class={compact
				? 'bg-muted flex size-14 shrink-0 items-center justify-center rounded-md'
				: 'bg-muted flex size-14 shrink-0 items-center justify-center rounded-xl sm:size-18'}
		>
			<Package class="text-muted-foreground size-6" />
		</div>
	{/if}

	<div class="min-w-0 flex-1">
		<div class="flex flex-wrap items-center gap-2">
			<p class="truncate font-semibold">{product?.name ?? 'Unknown Item'}</p>
			{#if pending}
				<span class="border-primary/25 text-primary rounded-full border px-2 py-0.5 text-xs font-semibold">
					{pendingLabel ?? 'Pending'}
				</span>
			{/if}
		</div>
		{#if !compact}
			<p class="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">
				{description ?? product?.description ?? 'Included in this checkout.'}
			</p>
		{/if}
		<p class={compact ? 'text-muted-foreground text-sm' : 'mt-2 text-sm font-medium'}>{price}</p>
	</div>

	<button
		class="text-muted-foreground hover:text-destructive shrink-0 rounded-full p-1.5 transition-colors disabled:opacity-50"
		onclick={onremove}
		disabled={productAction === 'removing' || !canRemove}
		aria-label="Remove {product?.name ?? 'item'}"
	>
		<X class="size-4" />
	</button>
</div>
