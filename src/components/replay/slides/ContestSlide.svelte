<script lang="ts">
	import type { ContestRecap } from '$lib/api/schemas';

	interface Props {
		data: ContestRecap;
	}

	let { data }: Props = $props();

	// Sort crops by participation
	let sortedCrops = $derived(Object.entries(data.perCrop).sort(([, a], [, b]) => b - a));
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-yellow-900 to-orange-900 p-8"
>
	<h2 class="animate-slide-in-left mb-12 text-5xl font-bold text-yellow-300">Jacob's Contests</h2>

	<div class="grid w-full max-w-5xl grid-cols-1 gap-12 md:grid-cols-2">
		<!-- Participation Stats -->
		<div class="animate-fade-in rounded-2xl bg-black/30 p-8 backdrop-blur-md delay-200">
			<h3 class="mb-2 text-center text-3xl font-bold">{data.total}</h3>
			<p class="mb-6 text-center text-gray-300">Total Contests Joined</p>

			<div class="space-y-3">
				{#each sortedCrops.slice(0, 5) as [crop, count]}
					<div class="flex items-center justify-between">
						<span class="font-medium">{crop}</span>
						<div class="flex w-2/3 items-center gap-2">
							<div
								class="h-3 rounded-full bg-yellow-600"
								style:width="{(count / data.total) * 100}%"
							></div>
							<span class="text-sm text-gray-400">{count}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Highest Placements -->
		<div class="animate-fade-in rounded-2xl bg-black/30 p-8 backdrop-blur-md delay-500">
			<h3 class="mb-6 text-center text-2xl font-bold">Best Performances</h3>
			<div class="space-y-6">
				{#each data.highestPlacements as placement}
					<div class="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold
                            {placement.medal === 'Diamond'
								? 'bg-cyan-400 text-black'
								: placement.medal === 'Platinum'
									? 'bg-slate-300 text-black'
									: 'bg-yellow-500 text-black'}"
						>
							{placement.medal[0]}
						</div>
						<div>
							<p class="text-lg font-bold">{placement.crop}</p>
							<p class="text-yellow-400">Rank #{placement.rank}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes slide-in-left {
		from {
			opacity: 0;
			transform: translateX(-50px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	.animate-slide-in-left {
		animation: slide-in-left 0.8s ease-out forwards;
	}
	.delay-200 {
		animation-delay: 0.2s;
		opacity: 0;
		animation-fill-mode: forwards;
	}
	.delay-500 {
		animation-delay: 0.5s;
		opacity: 0;
		animation-fill-mode: forwards;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in {
		animation: fade-in 0.8s ease-out forwards;
	}
</style>
