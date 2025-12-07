<script lang="ts">
	import type { LeaderboardRecap } from '$lib/api/schemas';

	interface Props {
		data: LeaderboardRecap;
	}

	let { data }: Props = $props();

	// Sort by rank (lower is better) and take top 5
	let topPlacements = $derived([...data.top1000].sort((a, b) => a.rank - b.rank).slice(0, 5));
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-fuchsia-900 p-8"
>
	<h2 class="animate-bounce-in mb-12 text-5xl font-bold text-fuchsia-300">Leaderboard Legends</h2>

	<div class="w-full max-w-2xl">
		<!-- Top 1000 -->
		<div class="animate-slide-up rounded-3xl bg-black/20 p-8 backdrop-blur-sm delay-200">
			<h3 class="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-fuchsia-200">
				<span>🏆</span> Top Placements
			</h3>
			{#if topPlacements.length > 0}
				<div class="space-y-4">
					{#each topPlacements as item}
						<div
							class="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
						>
							<div>
								<div class="text-lg font-medium text-white">
									{item.shortTitle || item.title}
								</div>
								<div class="text-sm text-fuchsia-200/70">
									{new Intl.NumberFormat('en-US', { notation: 'compact' }).format(item.amount)}
								</div>
							</div>
							<span class="text-xl font-bold text-yellow-400">#{item.rank}</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-8 text-center">
					<p class="text-xl text-gray-400 italic">No top 1000 placements this year.</p>
					<p class="mt-2 text-fuchsia-300">Keep grinding for next year! 💪</p>
				</div>
			{/if}
		</div>
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
	.delay-400 {
		animation-delay: 0.4s;
	}
</style>
