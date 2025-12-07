<script lang="ts">
	interface Props {
		hasPurchased: boolean;
	}

	let { hasPurchased }: Props = $props();
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-green-900 to-emerald-900 p-8"
>
	<h2 class="animate-fade-in mb-12 text-4xl font-bold text-emerald-300">Did you support us?</h2>

	<div class="animate-scale-up relative">
		{#if hasPurchased}
			<div class="text-center">
				<div class="mb-6 text-9xl">💖</div>
				<h3 class="mb-4 text-6xl font-black text-white">YES!</h3>
				<p class="text-2xl text-emerald-200">Thank you for your support!</p>
			</div>
		{:else}
			<div class="text-center">
				<div class="mb-6 text-9xl">👀</div>
				<h3 class="mb-4 text-6xl font-black text-white">Not yet...</h3>
				<p class="text-2xl text-emerald-200">Maybe next year?</p>
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
