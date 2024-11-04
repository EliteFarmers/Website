<script lang="ts">
	import type { components } from '$lib/api/api';

	export let product: components['schemas']['ProductDto'];

	// Not localized because Discord only accepts USD anyway
	$: dollars = ((product.price ?? 0) / 100).toFixed(2);
	$: free = !product.price || +dollars === 0;
</script>

<p
	class="text-center h-fit bg-green-600 dark:bg-green-700 text-white font-semibold leading-none rounded-md px-4 py-1 {free
		? 'pb-1.5'
		: ''}"
>
	{#if free}
		Free
	{:else}
		<span class="whitespace-nowrap">{dollars} USD</span>
		{#if product.isSubscription}<br />
			<span class="text-xs whitespace-nowrap">per month</span>
		{/if}
	{/if}
</p>
