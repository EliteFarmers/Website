<script lang="ts">
	import type { components } from '$lib/api/api';
	import JacobCropStats from './jacob-crop-stats.svelte';

	interface Props {
		jacob: components['schemas']['JacobDataDto'] | undefined | null;
	}

	let { jacob }: Props = $props();

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

<div class="flex max-w-6xl flex-wrap items-center justify-center gap-4">
	{#each highest as [crop, amount] (crop)}
		<JacobCropStats {jacob} {crop} count={amount} />
	{/each}
</div>
