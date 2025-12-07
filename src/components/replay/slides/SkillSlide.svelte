<script lang="ts">
	interface Props {
		data: {
			farmingXp: number;
			breakdown: Record<string, number>;
			globalTotal: number;
			averageComparison: number;
		};
	}

	let { data }: Props = $props();

	const formatCompact = (num: number) =>
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
	const formatPercent = (num: number) => {
		const val = num * 100;
		return val > 0 ? `+${val.toFixed(0)}%` : `${val.toFixed(0)}%`;
	};

	let allSkills = $derived(Object.entries(data.breakdown).sort(([, a], [, b]) => b - a));
</script>

<div class="flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-indigo-900 to-blue-900 p-4 pt-16 md:p-8">
	<div class="mb-4 flex shrink-0 items-baseline justify-between">
		<h2 class="animate-fade-in text-3xl font-bold text-indigo-300 md:text-4xl">Skill Mastery</h2>
		<div class="text-right">
			<span class="text-4xl font-black text-white md:text-5xl">{formatCompact(data.farmingXp)}</span>
			<p class="text-sm font-normal text-indigo-200">Farming XP</p>
		</div>
	</div>

	<div
		class="custom-scrollbar mb-4 grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto md:grid-cols-4 md:gap-4"
	>
		{#each allSkills as [skill, xp], i}
			<div
				class="animate-slide-up flex flex-col items-center gap-2 rounded-xl bg-black/20 p-3 text-center transition-transform hover:scale-105"
				style:animation-delay="{i * 50}ms"
			>
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-sm font-bold text-indigo-100 md:h-12 md:w-12 md:text-base"
				>
					{skill[0]}
				</div>
				<div class="min-w-0">
					<p class="truncate text-xs font-bold text-indigo-200 md:text-sm">{skill}</p>
					<p class="text-lg font-black text-white md:text-xl">{formatCompact(xp)}</p>
				</div>
			</div>
		{/each}
	</div>

	<div class="animate-fade-in mt-auto shrink-0 pt-2 delay-500">
		<div
			class="flex items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-500/20 p-4 px-6 text-center backdrop-blur-sm"
		>
			<div class="text-left">
				<p class="text-sm text-indigo-200">vs Global Average</p>
				<p class="text-xs text-indigo-300/70">Compared to all players</p>
			</div>
			<p class="text-3xl font-black text-white">{formatPercent(data.averageComparison)}</p>
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
