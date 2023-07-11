<script lang="ts">
	import type { components } from '$lib/eliteapi/api';

	export let weight: components['schemas']['FarmingWeightDto'] | undefined;

	$: total = weight?.totalWeight ?? 0;
	$: bonus = Object.values(bonusSources).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0;
	$: bonusSources = weight?.bonusWeight ?? {};
	$: cropSources = weight?.cropWeight ?? {};

	$: {
		if (!weight) {
			weight = {
				totalWeight: 0,
				cropWeight: {},
				bonusWeight: {}
			};
		}
	}

	$: sources = Object.entries(cropSources ?? {}).sort((a, b) => (b?.[1] ?? 0) - (a?.[1] ?? 0));
	$: bonuses = Object.entries(weight?.bonusWeight ?? {}).sort((a, b) => a[0].localeCompare(b[0]));

	$: {
		if (sources.length === 0) {
		sources.push(['None Found - API might be off', 0]);
		}

		if (bonuses.length === 0) {
			bonuses.push(['No bonuses unlocked yet!', 0]);
		}
	}
</script>

<section class="py-4 flex justify-center align-middle" aria-labelledby="Breakdown">
	<div class="w-[90%] md:w-[70%] bg-gray-100 dark:bg-zinc-800 rounded-lg p-4">
		<h1 id="Breakdown" class="text-3xl text-center pt-2">Weight Breakdown - {total.toLocaleString()}</h1>
		<div class="block md:flex justify-evenly py-4">
			<div class="w-full md:w-1/3">
				<h3>
					Crops
					<span class="text-gray-500 dark:text-zinc-300 pl-2"
						>({(total - bonus).toLocaleString()})</span
					>
				</h3>
				{#each sources as [source, value] (source)}
					<div class="item">
						<div class="flex-grow">{source}</div>
						<div class="flex-none">{value?.toLocaleString() ?? 0}</div>
					</div>
				{/each}
			</div>
			<div class="w-full md:w-1/3">
				<h3>Bonus<span>({bonus.toLocaleString()})</span></h3>
				{#each bonuses as [bonus, value] (bonus)}
					<div class="item">
						<div class="flex-grow capitalize">{bonus}</div>
						<div class="flex-none">{value?.toLocaleString() ?? 0}</div>
					</div>
				{/each}
				<br />
				<h3>Questions?</h3>
				<div class="text-md pt-1">
					View all calculations on the <a href="/info" class="text-blue-600 hover:underline">info page</a>.
				</div>
			</div>
		</div>
	</div>
</section>

<style lang="postcss">
	.item {
		@apply flex flex-row items-center p-1;
	}

	h3 {
		@apply text-2xl font-semibold py-2;
	}

	h3 > span {
		@apply text-xl text-gray-500 pl-2 font-normal;
	}

	/* Alternate background colors */
	.item:nth-child(odd) {
		@apply bg-opacity-25 bg-gray-400;
	}
</style>
