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

<p
	class="h-fit rounded-md bg-green-600 px-4 pb-1 pt-0.5 text-center font-semibold leading-none text-white dark:bg-green-700 {free
		? 'pb-1.5'
		: ''}"
>
	{#if free}
		Free
	{:else}
		<span class="whitespace-nowrap leading-none">{dollars} USD</span>
		{#if product.isSubscription}<br />
			<span class="whitespace-nowrap text-xs leading-none">per month</span>
		{/if}
	{/if}
</p>
