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
	import { PUBLIC_DISCORD_CLIENT_ID } from '$env/static/public';

	export let product: components['schemas']['ProductDto'];

	$: features = product.features ?? {};
	$: styles = product.weightStyles ?? [];
	$: console.log(product);

	$: image = `https://cdn.discordapp.com/app-assets/${PUBLIC_DISCORD_CLIENT_ID}/store/${product.id}.webp?size=480`;
</script>

<a class="m-1 p-4 inline-block bg-primary-foreground rounded-md hover:shadow-lg" href="/shop/{product.id}">
	<div class="flex flex-col min-w-0 justify-start items-start gap-4">
		<div class="backdrop-blur-xl aspect-square min-h-32" style="background-image: url({image});" />
		{#if product.icon}
			<img src={product.icon} alt={product.name} class="w-8 h-8 rounded-sm object-cover" />
		{/if}
		<div class="flex flex-row gap-2 justify-between">
			<p class="text-xl overflow-hidden whitespace-nowrap text-ellipsis pr-4">{product.name}</p>
			<!-- {#if product.price}
				<p class="text-xl">${product.price}</p>
			{/if} -->
		</div>
	</div>
</a>
