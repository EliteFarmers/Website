<script lang="ts">
	import type { LeaderboardRecap } from '$lib/api/schemas';
	import * as Item from '$ui/item/index.js';
	import Trophy from '@lucide/svelte/icons/trophy';

	interface Props {
		data: LeaderboardRecap;
	}

	let { data }: Props = $props();

	// Sort by rank (lower is better) and take top 5
	let topPlacements = $derived([...data.top1000].sort((a, b) => a.rank - b.rank).slice(0, 5));
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-fuchsia-950 to-purple-950 p-8 text-white"
>
	<h2
		class="animate-bounce-in mb-12 bg-gradient-to-r from-fuchsia-300 to-purple-400 bg-clip-text text-center text-5xl font-bold text-transparent"
	>
		Leaderboard Legends
	</h2>

	<div class="animate-slide-up w-full max-w-xl delay-200">
		<h3 class="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-white">
			<Trophy class="size-6 text-yellow-400" /> Top Placements
		</h3>

		<div class="space-y-4">
			{#each topPlacements as item (item.slug)}
				<Item.Root variant="outline" class="border-white/10 bg-white/5 backdrop-blur-sm">
					<Item.Content>
						<Item.Title class="text-white">{item.shortTitle || item.title}</Item.Title>
						<Item.Description class="text-fuchsia-200/70">
							{new Intl.NumberFormat('en-US', { notation: 'compact' }).format(item.amount)}
						</Item.Description>
					</Item.Content>
					<Item.Actions>
						<span class="text-xl font-bold text-yellow-400">#{item.rank}</span>
					</Item.Actions>
				</Item.Root>
			{/each}
		</div>

		{#if topPlacements.length === 0}
			<div class="rounded-xl border border-white/10 bg-white/5 py-8 text-center">
				<p class="text-xl text-zinc-400 italic">No top 1000 placements this year.</p>
				<p class="mt-2 text-fuchsia-300">Keep grinding for next year! 💪</p>
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
