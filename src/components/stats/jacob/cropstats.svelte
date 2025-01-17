<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { cn } from '$lib/utils';
	import JacobCropStats from './jacob-crop-stats.svelte';

	let { class: className }: { class?: string } = $props();

	const ctx = getStatsContext();
	const jacob = $derived(ctx.member.jacob);

	let highest = $derived(
		Object.entries(
			jacob?.contests?.reduce(
				(acc, contest) => {
					if (!contest?.crop) return acc;

					if (contest.crop in acc) {
						acc[contest.crop]++;
					} else {
						acc[contest.crop] = 1;
					}
					return acc;
				},
				{} as Record<string, number>
			) ?? {}
		).sort()
	);
</script>

<div class={cn('flex max-w-6xl flex-wrap items-center justify-center gap-4', className)}>
	{#each highest as [crop, amount] (crop)}
		<JacobCropStats {jacob} {crop} count={amount} />
	{/each}
</div>
