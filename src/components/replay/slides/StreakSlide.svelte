<script lang="ts">
	import DateDisplay from '$comp/time/date-display.svelte';
	import type { StreakRecap } from '$lib/api/schemas';
	import * as Item from '$ui/item/index.js';
	import Moon from '@lucide/svelte/icons/moon';
	import Zap from '@lucide/svelte/icons/zap';
	import { scaleLinear } from 'd3-scale';

	interface Props {
		data: StreakRecap;
	}

	let { data }: Props = $props();

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
	class="flex h-full w-full flex-col items-center justify-center bg-linear-to-b from-cyan-950 to-blue-950 p-8 text-white"
>
	<h2
		class="animate-fade-in h-16 bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-center text-5xl font-bold text-transparent"
	>
		Best Farming Streak
	</h2>
	<div class="animate-fade-in mb-12 flex flex-wrap gap-2">
		<DateDisplay class="rounded bg-blue-500/20 px-2 py-1 text-cyan-200" timestamp={Number(data.start) * 1000} />
		<span>-</span>
		<DateDisplay class="rounded bg-blue-500/20 px-2 py-1 text-cyan-200" timestamp={Number(data.end) * 1000} />
	</div>

	<div class="flex w-full max-w-4xl flex-col items-center justify-center gap-8 md:flex-row">
		<!-- Longest Streak -->
		<Item.Root
			variant="outline"
			class="animate-slide-up border-white/10 bg-white/5 p-8 backdrop-blur-md transition-transform delay-100"
		>
			<Item.Media
				variant="icon"
				class="mb-4 flex size-16 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
			>
				<Zap class="size-8" />
			</Item.Media>
			<Item.Content>
				<Item.Title class="min-w-48 text-6xl font-black text-white">{data.longestStreakHours}</Item.Title>
				<Item.Description class="mt-2 text-xl font-medium text-cyan-200">Hours</Item.Description>
			</Item.Content>
		</Item.Root>

		<!-- Daily Downtime -->
		{#if data.longestStreakHours > 24}
			<Item.Root
				variant="outline"
				class="animate-slide-up border-white/10 bg-white/5 p-8 backdrop-blur-md transition-transform delay-300"
			>
				<Item.Media
					variant="icon"
					class="mb-4 flex size-16 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
				>
					<Moon class="size-8" />
				</Item.Media>
				<Item.Content>
					<Item.Title class="text-6xl font-black text-white"
						>{data.averageDailyDowntime.toFixed(1)}</Item.Title
					>
					<Item.Description class="mt-2 text-xl font-medium text-indigo-200"
						>Hours Downtime / Day</Item.Description
					>
				</Item.Content>
			</Item.Root>
		{/if}
	</div>

	<!-- Sparkline Activity -->
	<div class="animate-fade-in mt-12 w-full max-w-2xl delay-500">
		<div class="flex flex-col items-center rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
			<h3 class="mb-4 text-sm font-semibold tracking-widest text-cyan-200 uppercase">Activity During Streak</h3>
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
	.animate-slide-up {
		animation: slide-up 0.8s ease-out forwards;
		opacity: 0;
	}
	.delay-100 {
		animation-delay: 0.1s;
	}
	.delay-300 {
		animation-delay: 0.3s;
	}
	.delay-500 {
		animation-delay: 0.5s;
	}
</style>
