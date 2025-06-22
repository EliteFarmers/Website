<script lang="ts">
	import type { components } from '$lib/api/api';

	interface Props {
		product: components['schemas']['ProductDto'];
	}

	let { product }: Props = $props();

	// Not localized because Discord only accepts USD anyway
	let dollars = $derived(((product.price ?? 0) / 100).toFixed(2));
	let free = $derived(!product.price || +dollars === 0);
</script>

<p class="bg-progress h-fit rounded-md px-4 py-2 text-center leading-none font-semibold text-white">
	{#if free}
		Free
	{:else}
		<span class="leading-none whitespace-nowrap">{dollars} USD</span>
		{#if product.isSubscription}<br />
			<span class="text-xs leading-none whitespace-nowrap">per month</span>
		{/if}
	{/if}
</p>
