<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let progress = $state(0);

	onMount(() => {
		const interval = setInterval(() => {
			progress += Math.random() * 10;
			if (progress >= 100) {
				progress = 100;
				clearInterval(interval);
			}
		}, 200);

		return () => clearInterval(interval);
	});
</script>

<div class="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black" out:fade={{ duration: 500 }}>
	<div class="animate-spin-slow relative mb-8 h-24 w-24">
		<div class="absolute inset-0 rounded-full border-4 border-yellow-500/30"></div>
		<div class="absolute inset-0 rounded-full border-4 border-t-yellow-500"></div>
	</div>

	<h2 class="mb-4 animate-pulse text-2xl font-bold text-white">Generating Your Recap...</h2>

	<div class="h-2 w-64 overflow-hidden rounded-full bg-gray-800">
		<div class="h-full bg-yellow-500 transition-all duration-300 ease-out" style:width="{progress}%"></div>
	</div>
</div>

<style>
	@keyframes spin-slow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	.animate-spin-slow {
		animation: spin-slow 3s linear infinite;
	}
</style>
