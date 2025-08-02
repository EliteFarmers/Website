<script lang="ts">
	import ProductFeature from '$comp/monetization/product-feature.svelte';
	import { Button } from '$comp/ui/button';
	import type { components } from '$lib/api/api';
	import { cn } from '$lib/utils';
	import Check from '@lucide/svelte/icons/check';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Heart from '@lucide/svelte/icons/heart';
	import Image from '@lucide/svelte/icons/image';
	import Palette from '@lucide/svelte/icons/palette';
	import Replace from '@lucide/svelte/icons/replace';
	import ScrollText from '@lucide/svelte/icons/scroll-text';
	import Tag from '@lucide/svelte/icons/tag';
	import TicketX from '@lucide/svelte/icons/ticket-x';
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';

	interface Props {
		product: components['schemas']['ProductDto'];
		class?: string;
		children?: Snippet;
		showPublished?: boolean;
		showFeatures?: boolean;
	}

	let { product, class: className = '', children, showPublished, showFeatures = true }: Props = $props();

	let features = $derived(product.features ?? {});
	let styles = $derived(product.weightStyles ?? []);
</script>

<div class={cn('bg-muted/50 m-1 inline-block rounded-md p-4', className)}>
	<div class="flex items-center justify-between">
		<div class="flex min-w-0 shrink items-center justify-start gap-2">
			{#if product.thumbnail?.url}
				<img src={product.thumbnail.url} alt={product.name} class="h-8 w-8 rounded-sm object-cover" />
			{/if}
			<div class="flex {showFeatures ? 'flex-col' : 'flex-row'} justify-start gap-2">
				{#if !showFeatures}
					{@render available()}
				{/if}
				<p class="overflow-hidden pr-4 text-xl text-ellipsis whitespace-nowrap">{product.name}</p>
				{#if showFeatures}
					<div class="flex flex-row items-center gap-1">
						{@render available()}
						{#if styles.length}
							<ProductFeature>
								{#snippet icon()}
									<Image size={16} />
								{/snippet}
								<p class="font-semibold">Unlocks weight styles:</p>
								{#each styles as style (style.id)}
									<p class="text-sm font-semibold">"{style.name}"</p>
								{/each}
							</ProductFeature>
						{/if}
						{#if features.embedColors?.length}
							<ProductFeature>
								{#snippet icon()}
									<Palette size={16} />
								{/snippet}
								<p class="font-semibold">Unlocks embed colors:</p>
								{#each features.embedColors as color, i (i)}
									<div class="flex flex-row items-center gap-1">
										<div class="h-4 w-4 rounded-sm" style="background-color: #{color}"></div>
										<span class="text-sm leading-none font-semibold">#{color}</span>
									</div>
								{/each}
							</ProductFeature>
						{/if}
						{#if features.badgeId}
							<ProductFeature>
								{#snippet icon()}
									<Tag size={16} />
								{/snippet}
								<p class="font-semibold">Unlocks a badge!</p>
							</ProductFeature>
						{/if}
						{#if features.customEmoji}
							<ProductFeature>
								{#snippet icon()}
									<Heart size={16} />
								{/snippet}
								<p class="font-semibold">Select a Custom Emoji!</p>
							</ProductFeature>
						{/if}
						{#if features.hideShopPromotions}
							<ProductFeature>
								{#snippet icon()}
									<TicketX size={16} />
								{/snippet}
								<p class="font-semibold">Hides shop promotions!</p>
							</ProductFeature>
						{/if}
						{#if features.weightStyleOverride}
							<ProductFeature>
								{#snippet icon()}
									<Replace size={16} />
								{/snippet}
								<p class="font-semibold">Apply your weight style on everyone!</p>
							</ProductFeature>
						{/if}
						{#if features.moreInfoDefault}
							<ProductFeature>
								{#snippet icon()}
									<ScrollText size={16} />
								{/snippet}
								<p class="font-semibold">More info in weight command by default!</p>
							</ProductFeature>
						{/if}
					</div>
				{/if}
			</div>
		</div>
		<div class="flex min-w-0 items-center justify-end gap-2">
			{#if children}
				{@render children()}
			{:else}
				<Button href="/shop/{product.id}" class="m-1" variant="ghost">
					<ExternalLink />
				</Button>
			{/if}
		</div>
	</div>
</div>

{#snippet available()}
	{#if showPublished}
		{#if product.available}
			<ProductFeature>
				{#snippet icon()}
					<Check size={16} />
				{/snippet}
				<p class="font-semibold">Available</p>
			</ProductFeature>
		{:else}
			<ProductFeature>
				{#snippet icon()}
					<X size={16} />
				{/snippet}
				<p class="font-semibold">Not available</p>
			</ProductFeature>
		{/if}
	{/if}
{/snippet}
