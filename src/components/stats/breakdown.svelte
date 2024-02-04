<script lang="ts">
	import type { components } from '$lib/api/api';

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
				bonusWeight: {},
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

<section class="py-4 flex justify-center align-middle w-full" aria-labelledby="Breakdown">
	<div class="w-full max-w-4xl bg-primary-foreground rounded-lg p-4 mx-2">
		<h1 id="Breakdown" class="text-3xl text-center pt-2">Weight Breakdown - {total.toLocaleString()}</h1>
		<div class="block md:flex justify-evenly py-4">
			<div class="w-full md:w-1/3">
				<h3 class="text-2xl font-semibold py-2">
					Crops
					<span class="pl-2 text-lg">({(total - bonus).toLocaleString()})</span>
				</h3>
				{#each sources as [source, value] (source)}
					<div class="flex flex-row items-center p-1 even:bg-card rounded-sm">
						<div class="flex-grow">{source}</div>
						<div class="flex-none">{value?.toLocaleString() ?? 0}</div>
					</div>
				{/each}
			</div>
			<div class="w-full md:w-1/3">
				<h3 class="text-2xl font-semibold py-2">
					Bonus<span class="pl-2 text-lg">({bonus.toLocaleString()})</span>
				</h3>
				{#each bonuses as [bonus, value] (bonus)}
					<div class="flex flex-row items-center p-1 even:bg-card rounded-sm">
						<div class="flex-grow capitalize">{bonus}</div>
						<div class="flex-none">{value?.toLocaleString() ?? 0}</div>
					</div>
				{/each}
				<br />
				<h3 class="text-2xl font-semibold py-2">Questions?</h3>
				<div class="text-md pt-1">
					View all calculations on the <a href="/info" class="text-blue-600 hover:underline">info page</a>.
				</div>
			</div>
		</div>
	</div>
</section>
