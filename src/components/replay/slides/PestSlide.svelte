<script lang="ts">
	import { getRecapContext } from '$lib/stores/recap.svelte';

	const context = getRecapContext();
	let data = $derived(context.data.pests);
	let global = $derived(context.current?.global);

	let topPests = $derived(
		Object.entries(data.breakdown)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 6)
	);

	const formatPercent = (num: number) => {
		const val = num * 100;
		return val > 0 ? `+${val.toFixed(0)}%` : `${val.toFixed(0)}%`;
	};

	const getComparison = (pest: string, count: number) => {
		if (!global) return 0;

		const globalTotal =
			global.totalPestsBreakdown[pest] ||
			global.totalPestsBreakdown[pest.toUpperCase()] ||
			global.totalPestsBreakdown[pest.replace(' ', '_').toUpperCase()] ||
			BigInt(0);

		if (globalTotal === BigInt(0)) return 0;
		const avg = Number(globalTotal) / global.trackedPlayers;
		return (count - avg) / avg;
	};
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-linear-to-br from-red-900 to-rose-900 p-4 md:p-8"
>
	<h2 class="animate-fade-in mb-2 text-center text-3xl font-bold text-rose-300 md:text-5xl">Pest Control</h2>
	<div class="animate-fade-in mb-4 flex flex-col items-center md:mb-8">
		<span class="text-4xl font-black text-white md:text-6xl">{data.kills.toLocaleString()}</span>
		<p class="text-xs font-medium tracking-widest text-rose-200 uppercase md:text-sm">Total Kills</p>
		{#if data.averageComparison}
			<div
				class="mt-2 rounded-full bg-black/30 px-2 py-0.5 text-xs font-bold md:text-sm
				{data.averageComparison > 0 ? 'text-green-400' : 'text-red-400'}"
			>
				{formatPercent(data.averageComparison)} vs Average
			</div>
		{/if}
	</div>

	<div class="grid w-full max-w-4xl grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
		{#each topPests as [pest, count], i (pest)}
			{@const comparison = getComparison(pest, count)}
			<div
				class="animate-slide-up flex flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 p-2 text-center backdrop-blur-lg transition-transform hover:scale-105 md:p-4"
				style:animation-delay="{i * 100}ms"
			>
				<div class="mb-1 md:mb-3">
					<img
						src="/images/pests/{pest.toLowerCase()}.png"
						alt={pest}
						class="pixelated h-10 w-10 object-contain drop-shadow-md filter md:h-16 md:w-16"
					/>
				</div>
				<h3 class="mb-0.5 text-sm font-bold text-rose-100 md:mb-1 md:text-xl">{pest}</h3>
				<p class="text-base font-black text-white md:text-2xl">{count.toLocaleString()}</p>
				{#if comparison}
					<div
						class="mt-1 rounded-full bg-black/30 px-1.5 py-0.5 text-[10px] font-bold md:mt-2 md:px-2 md:text-sm
						{comparison > 0 ? 'text-green-400' : 'text-red-400'}"
					>
						{formatPercent(comparison)} vs Avg
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
		animation: fade-in 0.8s ease-out forwards;
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
