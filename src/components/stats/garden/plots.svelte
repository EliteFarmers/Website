<script lang="ts">
	import { GARDEN_PLOTS } from '$lib/constants/crops';

	export let plots: string[] = [];

	$: unlockedPlots = [
		[false, false, false, false, false],
		[false, false, false, false, false],
		[false, false, 'barn', false, false],
		[false, false, false, false, false],
		[false, false, false, false, false],
	];

	$: plots.forEach((name) => {
		const plot = GARDEN_PLOTS[name as keyof typeof GARDEN_PLOTS];
		if (!plot) return;
		const [x, y] = plot;
		unlockedPlots[+y][+x] = true;
	});

	$: maxed = plots.length === 24;
</script>

<div class="flex flex-col md:flex-row gap-4 items-start">
	<div class="flex flex-col items-center gap-[0.1rem] md:gap-1">
		{#each unlockedPlots as row, i (i)}
			<div class="flex flex-row gap-[0.1rem] md:gap-1">
				{#each row as plot, j (j)}
					{#if plot === 'barn'}
						<div class="w-6 h-6 md:w-8 md:h-8" />
					{:else if plot}
						<div
							class="w-6 h-6 md:w-8 md:h-8 aspect-square rounded-sm
							{maxed ? 'bg-yellow-400 dark:bg-yellow-600' : 'bg-green-400 dark:bg-green-600'}"
						/>
					{:else}
						<div class="w-6 h-6 md:w-8 md:h-8 aspect-square rounded-sm bg-primary-foreground" />
					{/if}
				{/each}
			</div>
		{/each}
	</div>
	<div class="flex flex-col gap-2">
		<h3 class="text-lg font-semibold">Unlocked Plots</h3>
	</div>
</div>
