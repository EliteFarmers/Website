<script lang="ts">
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getRecapContext } from '$lib/stores/recap.svelte';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';

	const context = getRecapContext();
	let data = $derived(context.data.collections);
	let global = $derived(context.current?.global);

	const formatCompact = (num: number | bigint) =>
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
	const formatPercent = (num: number) => {
		const val = num * 100;
		return val > 0 ? `+${val.toFixed(0)}%` : `${val.toFixed(0)}%`;
	};

	let topCrops = $derived(
		Object.entries(data.increases)
			.sort(([, a], [, b]) => (b > a ? 1 : b < a ? -1 : 0))
			.slice(0, 6)
	);

	let totalIncreases = $derived(Object.values(data.increases).reduce((a, b) => Number(a) + Number(b), 0));
	let totalAverageComparison = $derived.by(() => {
		if (!global) return 0;
		const avg = Object.values(global.crops).reduce((a, b) => Number(a) + Number(b), 0);
		const diff = totalIncreases - avg;
		return diff / avg;
	});
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-linear-to-br from-lime-900 to-green-900 p-4 md:p-8"
>
	<h2 class="animate-fade-in mb-2 text-center text-3xl font-bold text-lime-300 md:text-5xl">Collection Gains</h2>
	<div class="animate-fade-in mb-4 flex flex-col items-center md:mb-8">
		<span class="text-4xl font-black text-white md:text-6xl">{formatCompact(totalIncreases)}</span>
		<p class="text-xs font-medium tracking-widest text-lime-200 uppercase md:text-sm">Total Collections</p>
		{#if totalAverageComparison}
			<div
				class="mt-2 rounded-full bg-black/30 px-2 py-0.5 text-xs font-bold md:text-sm
				{totalAverageComparison > 0 ? 'text-green-400' : 'text-red-400'}"
			>
				{formatPercent(totalAverageComparison)} vs Average
			</div>
		{/if}
	</div>

	<div class="grid w-full max-w-4xl grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
		{#each topCrops as [crop, amount], i (i)}
			<div
				class="animate-slide-up flex flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 p-2 text-center backdrop-blur-lg transition-transform hover:scale-105 md:p-4"
				style:animation-delay="{i * 100}ms"
			>
				<div class="mb-1 h-10 w-10 md:mb-3 md:h-16 md:w-16">
					<img
						src={PROPER_CROP_TO_IMG[getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)]}
						alt={crop}
						class="pixelated h-full w-full object-contain drop-shadow-md filter"
					/>
				</div>
				<h3 class="mb-0.5 text-sm font-bold text-lime-100 md:mb-1 md:text-xl">
					{getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)}
				</h3>
				<p class="text-base font-black text-white md:text-2xl">+{formatCompact(amount)}</p>

				{#if data.averageComparison?.[crop]}
					<div
						class="mt-1 rounded-full bg-black/30 px-1.5 py-0.5 text-[10px] font-bold md:mt-2 md:px-2 md:text-sm
						{(data.averageComparison[crop] ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}"
					>
						{formatPercent(data.averageComparison[crop] || 0)} vs Avg
					</div>
				{/if}
			</div>
		{/each}
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
</style>
