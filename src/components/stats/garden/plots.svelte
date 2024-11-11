<script lang="ts">
	import { run } from 'svelte/legacy';

	import { GARDEN_PLOTS } from '$lib/constants/crops';

	interface Props {
		plots?: string[];
	}

	let { plots = [] }: Props = $props();

	let unlockedPlots = $derived([
		[false, false, false, false, false],
		[false, false, false, false, false],
		[false, false, 'barn', false, false],
		[false, false, false, false, false],
		[false, false, false, false, false],
	]);

	run(() => {
		plots.forEach((name) => {
			const plot = GARDEN_PLOTS[name as keyof typeof GARDEN_PLOTS];
			if (!plot) return;
			const [x, y] = plot;
			unlockedPlots[+y][+x] = true;
		});
	});

	let maxed = $derived(plots.length === 24);
</script>

<div class="flex flex-col items-center gap-[0.1rem] md:gap-1">
	{#each unlockedPlots as row, i (i)}
		<div class="flex flex-row gap-[0.1rem] md:gap-1">
			{#each row as plot, j (j)}
				{#if plot === 'barn'}
					<div class="w-6 h-6 md:w-8 md:h-8 flex flex-row items-center justify-center">
						<span class="leading-none md:text-lg font-semibold">{plots.length}</span>
					</div>
				{:else if plot}
					<div
						class="w-6 h-6 md:w-8 md:h-8 aspect-square rounded-sm
						{maxed ? 'bg-yellow-400 dark:bg-yellow-600' : 'bg-green-400 dark:bg-green-600'}"
					></div>
				{:else}
					<div class="w-6 h-6 md:w-8 md:h-8 aspect-square rounded-sm bg-primary-foreground"></div>
				{/if}
			{/each}
		</div>
	{/each}
</div>
