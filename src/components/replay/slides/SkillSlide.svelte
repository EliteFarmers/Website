<script lang="ts">
	import { getRecapContext } from '$lib/stores/recap.svelte';

	const context = getRecapContext();
	let data = $derived(context.data.skills);
	let global = $derived(context.current?.global);

	const formatCompact = (num: number) =>
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
	const formatPercent = (num: number) => {
		const val = num * 100;
		return val > 0 ? `+${val.toFixed(0)}%` : `${val.toFixed(0)}%`;
	};

	let allSkills = $derived(Object.entries(data.breakdown).sort(([, a], [, b]) => b - a));
	let sum = $derived.by(() => Object.values(data.breakdown).reduce((a, b) => a + b, 0));

	const getComparison = (skill: string, xp: number) => {
		if (!global) return 0;
		let globalTotal = global.totalSkillsBreakdown[skill] || global.totalSkillsBreakdown[skill.toUpperCase()];

		if (!globalTotal) return 0;
		const avg = globalTotal / global.trackedPlayers;
		return (xp - avg) / avg;
	};

	let totalAverageComparison = $derived.by(() => {
		if (!global) return 0;
		const avg = Object.values(global.skills).reduce((a, b) => Number(a) + Number(b), 0);
		const diff = sum - avg;
		return diff / avg;
	});
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-linear-to-b from-indigo-950 to-blue-950 p-4 md:p-8"
>
	<h2 class="animate-fade-in mb-2 text-center text-3xl font-bold text-indigo-300 md:text-5xl">Skill Mastery</h2>
	<div class="animate-fade-in mb-4 flex flex-col items-center md:mb-8">
		<span class="text-4xl font-black text-white md:text-6xl">{formatCompact(sum)}</span>
		<p class="text-xs font-medium tracking-widest text-indigo-200 uppercase md:text-sm">Total XP</p>
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
		{#each allSkills.slice(0, 6) as [skill, xp], i (skill)}
			{@const comparison = getComparison(skill, xp)}
			<div
				class="animate-slide-up flex flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 p-2 text-center backdrop-blur-lg transition-transform hover:scale-105 md:p-4"
				style:animation-delay="{i * 100}ms"
			>
				<div
					class="mb-1 flex size-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-100 md:mb-3 md:size-16 md:text-xl"
				>
					{skill[0]}
				</div>
				<h3 class="mb-0.5 text-sm font-bold text-indigo-100 md:mb-1 md:text-xl">{skill}</h3>
				<p class="text-base font-black text-white md:text-2xl">+{formatCompact(xp)}</p>
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
