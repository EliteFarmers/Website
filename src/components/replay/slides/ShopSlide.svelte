<script lang="ts">
	import { getRecapContext } from '$lib/stores/recap.svelte';
	import Frown from '@lucide/svelte/icons/frown';
	import Heart from '@lucide/svelte/icons/heart';

	const context = getRecapContext();
	let purchased = $derived(context.data.shop.hasPurchased);
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-green-900 to-emerald-900 p-4 md:p-8"
>
	<h2 class="animate-fade-in mb-8 text-center text-2xl font-bold text-emerald-300 md:mb-12 md:text-3xl">
		Did you buy something from the shop?
	</h2>

	<div class="animate-scale-up relative">
		{#if purchased}
			<div class="text-center">
				<p><Heart class="mx-auto size-24 text-emerald-100 md:size-32" /></p>
				<h3 class="mb-2 text-5xl font-black text-white md:mb-4 md:text-6xl">YES!</h3>
				<p class="text-xl text-emerald-200 md:text-2xl">Thank you for your support!</p>
			</div>
		{:else}
			<div class="text-center">
				<p><Frown class="mx-auto size-24 text-emerald-100 md:size-32" /></p>
				<h3 class="mb-2 text-5xl font-black text-white md:mb-4 md:text-6xl">Not yet...</h3>
				<p class="text-xl text-emerald-200 md:text-2xl">Maybe next year?</p>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.animate-fade-in {
		animation: fade-in 1s ease-out forwards;
	}

	@keyframes scale-up {
		from {
			transform: scale(0.5);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
	.animate-scale-up {
		animation: scale-up 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s forwards;
		opacity: 0;
	}
</style>
