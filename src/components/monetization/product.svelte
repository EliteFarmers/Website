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

<div class="m-1 p-4 inline-block bg-primary-foreground rounded-md">
	<div class="flex justify-between items-center">
		<div class="flex flex-shrink min-w-0 justify-start items-center gap-4">
			{#if product.thumbnail?.url}
				<img src={product.thumbnail.url} alt={product.name} class="w-8 h-8 rounded-sm object-cover" />
			{/if}
			<div class="flex flex-col gap-2 justify-start">
				<p class="text-xl overflow-hidden whitespace-nowrap text-ellipsis pr-4">{product.name}</p>
				<div class="flex flex-row gap-1 items-center">
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
								<div class="flex flex-row gap-1 items-center">
									<div class="w-4 h-4 rounded-sm" style="background-color: #{color}"></div>
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
		<div class="flex justify-end min-w-0 items-center gap-4">
			<Button href="/shop/{product.id}" class="m-1" variant="ghost">
				<ExternalLink />
			</Button>
		</div>
	</div>
</div>
