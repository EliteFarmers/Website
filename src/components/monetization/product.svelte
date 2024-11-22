<script lang="ts">
	import { Button } from '$comp/ui/button';
	import type { components } from '$lib/api/api';
	import ProductFeature from '$comp/monetization/product-feature.svelte';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Palette from 'lucide-svelte/icons/palette';
	import Image from 'lucide-svelte/icons/image';
	import Tag from 'lucide-svelte/icons/tag';
	import TicketX from 'lucide-svelte/icons/ticket-x';
	import Replace from 'lucide-svelte/icons/replace';
	import ScrollText from 'lucide-svelte/icons/scroll-text';

	interface Props {
		product: components['schemas']['ProductDto'];
	}

	let { product }: Props = $props();

	let features = $derived(product.features ?? {});
	let styles = $derived(product.weightStyles ?? []);
</script>

<div class="m-1 inline-block rounded-md bg-primary-foreground p-4">
	<div class="flex items-center justify-between">
		<div class="flex min-w-0 flex-shrink items-center justify-start gap-4">
			{#if product.thumbnail?.url}
				<img src={product.thumbnail.url} alt={product.name} class="h-8 w-8 rounded-sm object-cover" />
			{/if}
			<div class="flex flex-col justify-start gap-2">
				<p class="overflow-hidden text-ellipsis whitespace-nowrap pr-4 text-xl">{product.name}</p>
				<div class="flex flex-row items-center gap-1">
					{#if styles.length}
						<ProductFeature>
							{#snippet icon()}
								<Image size={16} />
							{/snippet}
							<p class="font-semibold">Unlocks weight styles:</p>
							{#each styles as style}
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
							{#each features.embedColors as color}
								<div class="flex flex-row items-center gap-1">
									<div class="h-4 w-4 rounded-sm" style="background-color: #{color}"></div>
									<span class="text-sm font-semibold leading-none">#{color}</span>
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
			</div>
		</div>
		<div class="flex min-w-0 items-center justify-end gap-4">
			<Button href="/shop/{product.id}" class="m-1" variant="ghost">
				<ExternalLink />
			</Button>
		</div>
	</div>
</div>
