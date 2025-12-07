<script lang="ts">
	import type { PestRecap } from '$lib/api/schemas';

	interface Props {
		data: PestRecap;
	}

	let { data }: Props = $props();

	let allPests = $derived(Object.entries(data.breakdown).sort(([, a], [, b]) => b - a));
</script>

<div class="flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-red-900 to-rose-900 p-4 pt-16 md:p-8">
	<div class="mb-4 flex shrink-0 items-baseline justify-between">
		<h2 class="animate-fade-in text-3xl font-bold text-rose-300 md:text-4xl">Pest Control</h2>
		<div class="text-right">
			<span class="text-4xl font-black text-white md:text-5xl">{data.kills}</span>
			<p class="text-sm font-normal text-rose-200">Total Kills</p>
		</div>
	</div>

	<div
		class="custom-scrollbar mb-4 grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto md:grid-cols-4 md:gap-4"
	>
		{#each allPests as [pest, count], i}
			<div
				class="animate-slide-up flex flex-col items-center gap-2 rounded-xl bg-black/20 p-3 text-center transition-transform hover:scale-105"
				style:animation-delay="{i * 50}ms"
			>
				<img
					src={`/images/pests/${pest.toLowerCase()}.png`}
					alt={pest}
					class="pixelated h-10 w-10 object-contain md:h-12 md:w-12"
				/>
				<div class="min-w-0">
					<p class="truncate text-xs font-bold text-rose-100 md:text-sm">{pest}</p>
					<p class="text-lg font-black text-white md:text-xl">{count}</p>
				</div>
			</div>
		{/each}
	</div>

	<div class="animate-fade-in mt-auto shrink-0 rounded-2xl bg-black/20 p-4 delay-500">
		<h3 class="mb-2 text-sm font-bold text-rose-200">Monthly Activity</h3>
		<div class="flex h-16 items-end justify-between gap-1 md:h-24">
			{#each data.monthly as month}
				<div class="group flex flex-1 flex-col items-center gap-1">
					<div
						class="w-full rounded-t-sm bg-rose-400/50 transition-all group-hover:bg-rose-400"
						style:height="{(month.amount / Math.max(...data.monthly.map((m) => m.amount))) * 100}%"
					></div>
					<span class="text-[8px] text-rose-200/50 md:text-xs">{month.month[0]}</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
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
	.delay-500 {
		animation-delay: 0.5s;
		opacity: 0;
		animation-fill-mode: forwards;
	}
</style>
