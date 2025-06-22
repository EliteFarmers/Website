<script lang="ts">
	import type { components } from '$lib/api/api';

	interface Props {
		stats: NonNullable<components['schemas']['JacobCropStatsDto']>;
	}

	let { stats }: Props = $props();

	const medals = ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as (keyof typeof stats.medals)[];
</script>

<div class="flex flex-wrap justify-center gap-2 md:flex-row">
	{#each medals as medal (medal)}
		{@const amount = stats.medals?.[medal] ?? 0}
		<div
			class="bg-card flex max-w-32 min-w-20 flex-1 items-center justify-center gap-2 rounded-md px-2 py-1 md:px-4"
		>
			<img src="/images/medals/{medal}.webp" alt="Medal" class="pixelated h-6 w-6" />
			<p class="text-xl font-semibold">
				{amount.toLocaleString()}
			</p>
		</div>
	{/each}
</div>
