<script lang="ts">
	import DateDisplay from '$comp/time/date-display.svelte';
	import { getRecapContext } from '$lib/stores/recap.svelte';
	import * as Item from '$ui/item/index.js';
	import Moon from '@lucide/svelte/icons/moon';
	import Zap from '@lucide/svelte/icons/zap';
	import { scaleLinear } from 'd3-scale';

	const context = getRecapContext();
	let data = $derived(context.data.streak);

	let sparklineData = $derived((data.sparkline || []).map(Number));
	let width = 300;
	let height = 80;

	let pathD = $derived.by(() => {
		if (!sparklineData.length) return '';
		const xScale = scaleLinear()
			.domain([0, sparklineData.length - 1])
			.range([0, width]);
		const yScale = scaleLinear()
			.domain([0, Math.max(...sparklineData, 1)])
			.range([height, 0]);

		return (
			`M ${xScale(0)} ${yScale(sparklineData[0])} ` +
			sparklineData
				.slice(1)
				.map((d, i) => `L ${xScale(i + 1)} ${yScale(d)}`)
				.join(' ')
		);
	});

	let areaD = $derived.by(() => {
		if (!sparklineData.length) return '';
		return `${pathD} L ${width} ${height} L 0 ${height} Z`;
	});
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center overflow-auto bg-linear-to-b from-cyan-950 to-blue-950 p-4 text-white md:p-8"
>
	<h2
		class="animate-fade-in mb-2 h-auto bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-center text-3xl font-bold text-transparent md:mb-4 md:h-16 md:text-5xl"
	>
		Longest Farming Session
	</h2>
	<div class="animate-fade-in mb-6 flex flex-wrap justify-center gap-2 md:mb-12">
		<DateDisplay
			class="rounded bg-blue-500/20 px-2 py-1 text-sm text-cyan-200 md:text-base"
			timestamp={Number(data.start) * 1000}
		/>
		<span>-</span>
		<DateDisplay
			class="rounded bg-blue-500/20 px-2 py-1 text-sm text-cyan-200 md:text-base"
			timestamp={Number(data.end) * 1000}
		/>
	</div>

	<div class="flex w-full max-w-4xl flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
		<!-- Longest Streak -->
		<Item.Root
			variant="outline"
			class="animate-slide-up w-full border-white/10 bg-white/5 p-4 backdrop-blur-md transition-transform delay-100 md:w-auto md:p-8"
		>
			<Item.Media
				variant="icon"
				class="mb-2 flex size-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] md:mb-4 md:size-16"
			>
				<Zap class="size-6 md:size-8" />
			</Item.Media>
			<Item.Content>
				<Item.Title class="min-w-0 text-center text-4xl font-black text-white md:min-w-48 md:text-6xl"
					>{data.longestStreakHours}</Item.Title
				>
				<Item.Description class="mt-1 text-base font-medium text-cyan-200 md:mt-2 md:text-xl"
					>Hours</Item.Description
				>
			</Item.Content>
		</Item.Root>

		<!-- Daily Downtime -->
		{#if data.longestStreakHours > 24}
			<Item.Root
				variant="outline"
				class="animate-slide-up w-full border-white/10 bg-white/5 p-4 backdrop-blur-md transition-transform delay-300 md:w-auto md:p-8"
			>
				<Item.Media
					variant="icon"
					class="mb-2 flex size-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] md:mb-4 md:size-16"
				>
					<Moon class="size-6 md:size-8" />
				</Item.Media>
				<Item.Content>
					<Item.Title class="text-center text-4xl font-black text-white md:text-6xl"
						>{data.averageDailyDowntime.toFixed(1)}</Item.Title
					>
					<Item.Description class="mt-1 text-base font-medium text-indigo-200 md:mt-2 md:text-xl"
						>Hours Downtime / Day</Item.Description
					>
				</Item.Content>
			</Item.Root>
		{/if}
	</div>

	<!-- Sparkline Activity -->
	<div class="animate-fade-in mt-4 w-full max-w-2xl shrink-0 delay-500 md:mt-6">
		<div
			class="flex flex-col items-center rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm md:p-6"
		>
			<h3 class="mb-2 text-xs font-semibold tracking-widest text-cyan-200 uppercase md:mb-4 md:text-sm">
				Activity During Session
			</h3>
			{#if sparklineData.length > 0}
				<svg
					{width}
					{height}
					viewBox="0 0 {width} {height}"
					class="w-full overflow-visible drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]"
				>
					<defs>
						<linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stop-color="#22d3ee" stop-opacity="0.4" />
							<stop offset="100%" stop-color="#22d3ee" stop-opacity="0" />
						</linearGradient>
					</defs>
					<path d={areaD} fill="url(#sparkline-gradient)" />
					<path
						d={pathD}
						fill="none"
						stroke="#22d3ee"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{:else}
				<p class="text-zinc-500">No activity data available</p>
			{/if}
		</div>
	</div>

	<p class="mt-6 text-center text-xs text-zinc-500">
		This is a non-continous session! It ended when you took a break for more than 10 hours.
	</p>
</div>

<style>
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
		animation: fade-in 1s ease-out forwards;
		opacity: 0;
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
	.delay-500 {
		animation-delay: 0.5s;
	}
</style>
