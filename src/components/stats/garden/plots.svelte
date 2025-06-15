<script lang="ts">
	import { GARDEN_PLOTS } from 'farming-weight';

	interface Props {
		plots?: string[];
	}

	let { plots = [] }: Props = $props();

	let unlockedPlots = $state([
		[false, false, false, false, false],
		[false, false, false, false, false],
		[false, false, 'barn', false, false],
		[false, false, false, false, false],
		[false, false, false, false, false],
	]);

	$effect.pre(() => {
		plots.forEach((name) => {
			const plot = GARDEN_PLOTS[name as keyof typeof GARDEN_PLOTS];
			if (!plot) return;
			const [x, y] = plot.position;
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
					<div class="flex h-6 w-6 flex-row items-center justify-center md:h-8 md:w-8">
						<span class="font-semibold leading-none md:text-lg">{plots.length}</span>
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
