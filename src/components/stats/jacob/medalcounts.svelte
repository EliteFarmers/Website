<script lang="ts">
	export let medals = {
		diamond: 0,
		platinum: 0,
		gold: 0,
		silver: 0,
		bronze: 0,
	};
	export let participations = 0;
</script>

<div class="flex flex-col md:flex-row gap-2 md:gap-4 justify-evenly">
	{#if participations}
		<div
			class="flex items-baseline flex-1 justify-center gap-2 rounded-md p-2 md:px-4 bg-gray-100 dark:bg-zinc-800"
		>
			<p class="text-2xl font-semibold text-red-700">
				{participations.toLocaleString()}
			</p>
			<h2>Contest{participations > 1 ? 's' : ''}</h2>
		</div>
	{/if}
	{#each Object.entries(medals) as [medal, amount] (medal)}
		<div
			class="flex items-center flex-1 basis-8 justify-center gap-2 rounded-md p-2 md:px-4 bg-gray-100 dark:bg-zinc-800"
		>
			<img src="/images/medals/{medal}.webp" alt="Medal" class="w-8 h-8 pixelated" />
			<p class="text-2xl font-semibold">
				{amount.toLocaleString()}
			</p>
		</div>
	{/each}
</div>
