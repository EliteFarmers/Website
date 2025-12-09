<script lang="ts">
	import { getRecapContext } from '$lib/stores/recap.svelte';
	import * as Item from '$ui/item/index.js';

	const context = getRecapContext();
	let data = $derived(context.data.leaderboards);

	let topPlacements = $derived([...data.top1000].sort((a, b) => a.rank - b.rank).slice(0, 5));
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center overflow-auto bg-linear-to-b from-fuchsia-950 to-purple-950 p-4 text-white md:p-8"
>
	<h2
		class="animate-bounce-in mb-6 bg-linear-to-r from-fuchsia-300 to-purple-400 bg-clip-text text-center text-3xl font-bold text-transparent md:mb-12 md:text-5xl"
	>
		Top Leaderboard Placements
	</h2>

	<div class="animate-slide-up w-full max-w-xl delay-200">
		<div class="space-y-3 md:space-y-4">
			{#each topPlacements as item (item.slug)}
				<Item.Root variant="outline" class="border-white/10 bg-white/5 p-3 backdrop-blur-sm md:p-4">
					<Item.Content>
						<Item.Title class="text-sm text-white md:text-base">{item.shortTitle || item.title}</Item.Title>
						<Item.Description class="text-xs text-fuchsia-200/70 md:text-sm">
							{new Intl.NumberFormat('en-US', { notation: 'compact' }).format(item.amount)}
						</Item.Description>
					</Item.Content>
					<Item.Actions>
						<span class="text-base font-bold text-yellow-400 md:text-xl">#{item.rank}</span>
					</Item.Actions>
				</Item.Root>
			{/each}
		</div>

		{#if topPlacements.length === 0}
			<div class="rounded-xl border border-white/10 bg-white/5 py-4 text-center md:py-8">
				<p class="text-lg text-zinc-400 italic md:text-xl">No top 1000 placements this year.</p>
				<p class="mt-2 text-sm text-fuchsia-300 md:text-base">Keep grinding for next year!</p>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes bounce-in {
		0% {
			opacity: 0;
			transform: scale(0.3);
		}
		50% {
			opacity: 1;
			transform: scale(1.05);
		}
		70% {
			transform: scale(0.9);
		}
		100% {
			transform: scale(1);
		}
	}
	.animate-bounce-in {
		animation: bounce-in 0.8s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(40px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-slide-up {
		animation: slide-up 0.8s ease-out forwards;
		opacity: 0;
	}
	.delay-200 {
		animation-delay: 0.2s;
	}
</style>
