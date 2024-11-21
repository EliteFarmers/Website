<script lang="ts">
	interface Props {
		medals?: {
			diamond: number;
			platinum: number;
			gold: number;
			silver: number;
			bronze: number;
		};
		participations?: number;
	}

	let {
		medals = {
			diamond: 0,
			platinum: 0,
			gold: 0,
			silver: 0,
			bronze: 0,
		},
		participations = 0,
	}: Props = $props();
</script>

<div class="flex flex-col justify-evenly gap-2 md:flex-row md:gap-4">
	{#if participations}
		<div
			class="flex flex-1 items-baseline justify-center gap-2 rounded-md bg-gray-100 p-2 dark:bg-zinc-800 md:px-4"
		>
			<p class="text-2xl font-semibold text-red-700">
				{participations.toLocaleString()}
			</p>
			<h2>Contest{participations > 1 ? 's' : ''}</h2>
		</div>
	{/if}
	{#each Object.entries(medals) as [medal, amount] (medal)}
		<div
			class="flex flex-1 basis-8 items-center justify-center gap-2 rounded-md bg-gray-100 p-2 dark:bg-zinc-800 md:px-4"
		>
			<img src="/images/medals/{medal}.webp" alt="Medal" class="pixelated h-8 w-8" />
			<p class="text-2xl font-semibold">
				{amount.toLocaleString()}
			</p>
		</div>
	{/each}
</div>
