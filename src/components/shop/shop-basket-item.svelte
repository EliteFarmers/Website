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
		? 'flex items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-3'
		: compact
			? 'flex items-center gap-3 rounded-lg border border-border bg-card p-3'
			: 'flex items-center gap-4 rounded-2xl border border-border bg-background/70 p-4'}
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
				? 'flex size-14 shrink-0 items-center justify-center rounded-md bg-muted'
				: 'flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted sm:size-18'}
		>
			<Package class="size-6 text-muted-foreground" />
		</div>
	{/if}

	<div class="min-w-0 flex-1">
		<div class="flex flex-wrap items-center gap-2">
			<p class="truncate font-semibold">{product?.name ?? 'Unknown Item'}</p>
			{#if pending}
				<span class="rounded-full border border-primary/25 px-2 py-0.5 text-xs font-semibold text-primary">
					{pendingLabel ?? 'Pending'}
				</span>
			{/if}
		</div>
		{#if !compact}
			<p class="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
				{description ?? product?.description ?? 'Included in this checkout.'}
			</p>
		{/if}
		<p class={compact ? 'text-sm text-muted-foreground' : 'mt-2 text-sm font-medium'}>{price}</p>
	</div>

	<button
		class="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
		onclick={onremove}
		disabled={productAction === 'removing' || !canRemove}
		aria-label="Remove {product?.name ?? 'item'}"
	>
		<X class="size-4" />
	</button>
</div>
