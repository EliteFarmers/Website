<script lang="ts">
	import type { CollectionRecap } from '$lib/api/schemas';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';

	interface Props {
		data: CollectionRecap;
	}

	let { data }: Props = $props();

	const formatCompact = (num: number | bigint) =>
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
	const formatPercent = (num: number) => {
		const val = num * 100;
		return val > 0 ? `+${val.toFixed(0)}%` : `${val.toFixed(0)}%`;
	};

	let allCrops = $derived(Object.entries(data.increases).sort(([, a], [, b]) => (b > a ? 1 : b < a ? -1 : 0)));
	let maxMonthly = $derived(Math.max(...data.monthly.map((m) => m.amount)));
</script>

<div class="flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-lime-900 to-green-900 p-4 pt-16">
	<h2 class="animate-fade-in mb-4 text-center text-3xl font-bold text-lime-300">Collection Gains</h2>

	<!-- Compact Grid for Mobile -->
	<div
		class="custom-scrollbar mb-4 grid flex-1 grid-cols-2 content-start gap-2 overflow-y-auto md:grid-cols-5 md:gap-4"
	>
		{#each allCrops as [crop, amount], i (i)}
			<div
				class="animate-slide-up flex min-h-[100px] flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 p-2 text-center backdrop-blur-lg md:p-4"
				style:animation-delay="{i * 50}ms"
			>
				<div class="mb-1 h-8 w-8 md:h-12 md:w-12">
					<img
						src={PROPER_CROP_TO_IMG[getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)]}
						alt={crop}
						class="pixelated h-full w-full object-contain"
					/>
				</div>
				<h3 class="text-sm leading-tight font-bold text-lime-100 md:text-lg">{crop}</h3>
				<p class="text-lg font-black text-white md:text-2xl">+{formatCompact(amount)}</p>

				<div class="text-[10px] text-lime-200/80 md:text-xs">
					{#if data.averageComparison}
						<p
							class="{(data.averageComparison[crop] ?? 0) > 0
								? 'text-green-400'
								: 'text-red-400'} font-bold"
						>
							{formatPercent(data.averageComparison[crop] || 0)} vs Avg
						</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Monthly Breakdown Chart (Compressed) -->
	<div class="animate-fade-in mt-auto w-full shrink-0 rounded-xl bg-black/20 p-3 backdrop-blur-sm delay-500">
		<h3 class="mb-2 text-center text-sm font-bold text-white">Monthly Activity</h3>
		<div class="flex h-16 items-end justify-between gap-1 md:h-24">
			{#each data.monthly as month (month.month)}
				<div class="group flex flex-1 flex-col items-center">
					<div
						class="relative w-full rounded-t-sm bg-lime-500/30 transition-all duration-300 hover:bg-lime-400/50"
						style:height="{(month.amount / maxMonthly) * 100}%"
					></div>
					<span class="mt-1 text-[8px] text-gray-400 md:text-xs">{month.month[0]}</span>
				</div>
			{/each}
		</div>
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

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-slide-up {
		animation: slide-up 0.5s ease-out forwards;
		opacity: 0;
	}
	.delay-500 {
		animation-delay: 0.5s;
		opacity: 0;
		animation-fill-mode: forwards;
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.1);
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
	}
</style>
