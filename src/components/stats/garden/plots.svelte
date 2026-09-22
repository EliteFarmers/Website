<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { GARDEN_PLOTS } from 'farming-weight';

	const ctx = getStatsContext();

	const plots = $derived(ctx.garden?.plots ?? []);
	const unlockedPlots = $derived.by(() => {
		const grid: (boolean | 'barn')[][] = Array.from({ length: 5 }, () => Array<boolean | 'barn'>(5).fill(false));
		grid[2][2] = 'barn';
		for (const name of plots) {
			const plot = GARDEN_PLOTS[name as keyof typeof GARDEN_PLOTS];
			if (!plot) continue;
			const [x, y] = plot.position;
			grid[+y][+x] = true;
		}
		return grid;
	});

	let maxed = $derived(plots.length === 24);
</script>

<div class="flex w-fit flex-col gap-2 rounded-md bg-background p-3 text-foreground">
	<h3 class="text-lg leading-none font-semibold">Unlocked Plots</h3>
	<div class="flex flex-col items-center gap-[0.1rem] md:gap-1">
		{#each unlockedPlots as row, i (i)}
			<div class="flex flex-row gap-[0.1rem] md:gap-1">
				{#each row as plot, j (j)}
					{#if plot === 'barn'}
						<div class="flex h-6 w-6 flex-row items-center justify-center md:h-8 md:w-8">
							<span class="leading-none font-semibold md:text-lg">{plots.length}</span>
						</div>
					{:else if plot}
						<div
							class="aspect-square h-6 w-6 rounded-sm md:h-8 md:w-8
						{maxed ? 'bg-completed' : 'bg-progress'}"
						></div>
					{:else}
						<div class="aspect-square h-6 w-6 rounded-sm bg-card md:h-8 md:w-8"></div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>
