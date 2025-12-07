<script lang="ts">
	interface Props {
		pestData: {
			kills: number;
			breakdown: Record<string, number>;
			globalTotal: number;
			averageComparison: number;
			monthly: Array<{ month: string; amount: number }>;
		};
		skillData: {
			farmingXp: number;
			breakdown: Record<string, number>;
			globalTotal: number;
			averageComparison: number;
		};
	}

	let { pestData, skillData }: Props = $props();

	const formatCompact = (num: number) =>
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
	const formatPercent = (num: number) => {
		const val = num * 100;
		return val > 0 ? `+${val.toFixed(0)}%` : `${val.toFixed(0)}%`;
	};

	let allPests = $derived(Object.entries(pestData.breakdown).sort(([, a], [, b]) => b - a));
	let allSkills = $derived(Object.entries(skillData.breakdown).sort(([, a], [, b]) => b - a));
</script>

<div class="flex h-full w-full flex-col overflow-hidden md:flex-row">
	<!-- Pest Section -->
	<div
		class="relative flex h-1/2 flex-1 flex-col overflow-hidden bg-gradient-to-br from-red-900 to-rose-900 p-4 pt-16 md:h-full md:pt-4"
	>
		<div class="mb-2 flex shrink-0 items-baseline justify-between">
			<h2 class="text-2xl font-bold text-rose-300">Pests</h2>
			<span class="text-3xl font-black text-white"
				>{pestData.kills} <span class="text-sm font-normal text-rose-200">Total</span></span
			>
		</div>

		<div class="custom-scrollbar mb-2 grid flex-1 grid-cols-3 content-start gap-2 overflow-y-auto md:grid-cols-2">
			{#each allPests as [pest, count]}
				<div
					class="flex flex-col items-center gap-1 rounded-lg bg-black/20 p-1.5 text-center md:flex-row md:gap-2 md:text-left"
				>
					<img
						src={`/images/pests/${pest.toLowerCase()}.png`}
						alt={pest}
						class="pixelated h-6 w-6 object-contain"
					/>
					<div class="min-w-0">
						<p class="truncate text-[10px] text-rose-200 md:text-xs">{pest}</p>
						<p class="text-sm font-bold">{count}</p>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-auto shrink-0 rounded-xl bg-black/20 p-2">
			<div class="flex h-8 items-end justify-between gap-0.5">
				{#each pestData.monthly as month}
					<div
						class="flex-1 rounded-t-sm bg-rose-400/50"
						style:height="{(month.amount / Math.max(...pestData.monthly.map((m) => m.amount))) * 100}%"
					></div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Skill XP Section -->
	<div
		class="relative flex h-1/2 flex-1 flex-col overflow-hidden bg-gradient-to-br from-indigo-900 to-blue-900 p-4 md:h-full"
	>
		<div class="mb-2 flex shrink-0 items-baseline justify-between">
			<h2 class="text-2xl font-bold text-indigo-300">Skills</h2>
			<span class="text-3xl font-black text-white"
				>{formatCompact(skillData.farmingXp)} <span class="text-sm font-normal text-indigo-200">XP</span></span
			>
		</div>

		<div class="custom-scrollbar grid flex-1 grid-cols-3 content-start gap-2 overflow-y-auto md:grid-cols-2">
			{#each allSkills as [skill, xp]}
				<div
					class="flex flex-col items-center gap-1 rounded-lg bg-black/20 p-1.5 text-center md:flex-row md:gap-2 md:text-left"
				>
					<div
						class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-[10px] font-bold"
					>
						{skill[0]}
					</div>
					<div class="min-w-0">
						<p class="truncate text-[10px] text-indigo-200 md:text-xs">{skill}</p>
						<p class="text-sm font-bold">{formatCompact(xp)}</p>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-auto shrink-0 pt-2">
			<div
				class="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/20 p-2 px-4 text-center"
			>
				<p class="text-xs text-indigo-200">vs Global Avg</p>
				<p class="text-xl font-bold text-white">{formatPercent(skillData.averageComparison)}</p>
			</div>
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 3px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.1);
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
	}
</style>
