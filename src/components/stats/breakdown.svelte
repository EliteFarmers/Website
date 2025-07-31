<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';

	const ctx = getStatsContext();
	const weight = $derived(
		ctx.member.farmingWeight ?? {
			totalWeight: 0,
			cropWeight: {},
			bonusWeight: {},
		}
	);

	let total = $derived(weight?.totalWeight ?? 0);
	let bonusSources = $derived(weight?.bonusWeight ?? {});
	let bonus = $derived(Object.values(bonusSources).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0);
	let cropSources = $derived(weight?.cropWeight ?? {});
	let sources = $derived(Object.entries(cropSources ?? {}).sort((a, b) => (b?.[1] ?? 0) - (a?.[1] ?? 0)));
	let bonuses = $derived(Object.entries(weight?.bonusWeight ?? {}).sort((a, b) => a[0].localeCompare(b[0])));
</script>

<section class="flex w-full flex-1 justify-center py-4 align-middle" aria-labelledby="Breakdown">
	<div class="bg-card w-full max-w-4xl rounded-lg">
		<h2 id="Breakdown" class="mt-6 text-center">
			<span class="mx-2 text-3xl font-semibold">{total.toLocaleString()}</span>
			<span class="text-lg">Farming Weight</span>
		</h2>
		<div class="flex flex-col justify-evenly gap-4 px-4 pb-4 md:flex-row">
			<div class="flex-1">
				<h3 class="py-2 text-2xl font-semibold">
					Crops
					<span class="pl-2 text-lg">({(total - bonus).toLocaleString()})</span>
				</h3>
				{#each sources as [source, value] (source)}
					<div class="even:bg-card flex flex-row items-center rounded-sm p-1">
						<div class="grow">{source}</div>
						<div class="flex-none">{value?.toLocaleString() ?? 0}</div>
					</div>
				{:else}
					<div class="flex flex-row items-center rounded-sm p-1 even:bg-card">
						<div class="grow">No crops found!</div>
						<div class="flex-none">0</div>
					</div>
				{/each}
			</div>
			<div class="flex-1">
				<h3 class="py-2 text-2xl font-semibold">
					Bonus<span class="pl-2 text-lg">({bonus.toLocaleString()})</span>
				</h3>
				{#each bonuses as [bonus, value] (bonus)}
					<div class="even:bg-card flex flex-row items-center rounded-sm p-1">
						<div class="grow capitalize">{bonus}</div>
						<div class="flex-none">{value?.toLocaleString() ?? 0}</div>
					</div>
				{:else}
					<div class="flex flex-row items-center rounded-sm p-1 even:bg-card">
						<div class="grow">No bonuses unlocked yet!</div>
						<div class="flex-none">0</div>
					</div>
				{/each}
				<br />
				<h3 class="py-2 text-2xl font-semibold">Questions?</h3>
				<div class="text-md pt-1">
					View all calculations on the <a href="/info" class="text-link hover:underline">info page</a>.
				</div>
			</div>
		</div>
	</div>
</section>
