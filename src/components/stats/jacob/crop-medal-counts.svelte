<script lang="ts">
	import type { components } from '$lib/api/api';

	interface Props {
		contests: components['schemas']['ContestParticipationDto'][];
	}

	let { contests }: Props = $props();

	const medals = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

	let counts = $derived(
		contests.reduce(
			(acc, contest) => {
				if (!contest.medal || contest.medal === 'none') return acc;

				acc[contest.medal] ??= 0;
				acc[contest.medal] += 1;
				return acc;
			},
			{} as Record<string, number>
		)
	);
</script>

<div class="flex flex-wrap justify-center gap-2 md:flex-row">
	{#each medals as medal (medal)}
		{@const amount = counts[medal] ?? 0}
		<div
			class="flex flex-1 basis-8 items-center justify-center gap-2 rounded-md bg-primary-foreground px-2 py-1 md:px-4"
		>
			<img src="/images/medals/{medal}.webp" alt="Medal" class="pixelated h-6 w-6" />
			<p class="text-xl font-semibold">
				{amount.toLocaleString()}
			</p>
		</div>
	{/each}
</div>
