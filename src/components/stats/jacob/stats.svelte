<script lang="ts">
	import { page } from '$app/state';
	import { getStatsContext } from '$lib/stores/stats.svelte';

	const ctx = getStatsContext();

	const jacob = $derived(ctx.member.jacob);
	const participationsRank = $derived(ctx.ranks?.participations?.rank ?? -1);
	const firstPlacesRank = $derived(ctx.ranks?.firstplace?.rank ?? -1);

	let firstPlaces = $derived(jacob?.firstPlaceScores ?? 0);

	// Calculate which crop has the most contests and get the count
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
		).reduce(
			(acc, [crop, count]) => {
				if (count > acc[1]) {
					acc[0] = crop;
					acc[1] = count;
				}
				return acc;
			},
			['', 0]
		)
	);
</script>

<div class="mb-2 flex w-full max-w-4xl flex-col items-center gap-2 md:items-start">
	<h1 class="mb-0.5 text-2xl">General Stats</h1>
	<div class="flex w-full flex-col justify-center gap-2 md:flex-row md:gap-4">
		<div
			class="bg-card flex w-full flex-row items-center justify-center gap-3 rounded-md p-1 text-center md:flex-col md:gap-1 md:p-2"
		>
			<div class="flex flex-row items-baseline justify-center gap-2">
				{#if firstPlacesRank !== -1}
					<a
						href="/leaderboard/firstplace/{page.params.id}-{page.params.profile}"
						class="pd-0.5 bg-card hover:bg-muted rounded-md px-1.5"
					>
						<span class="xs:text-md text-sm sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
							>{firstPlacesRank}</span
						>
					</a>
				{/if}
				<p class="mt-0 text-2xl">{firstPlaces.toLocaleString() ?? 0}</p>
			</div>
			<h2 class="md:text-md text-sm leading-none">First Place Contests</h2>
		</div>
		<div
			class="bg-card flex w-full flex-row items-center justify-center gap-3 rounded-md p-1 text-center align-bottom md:flex-col md:gap-1 md:p-2"
		>
			<div class="flex flex-row items-baseline justify-center gap-2">
				{#if participationsRank !== -1}
					<a
						href="/leaderboard/participations/{page.params.id}-{page.params.profile}"
						class="pd-0.5 bg-card hover:bg-muted rounded-md px-1.5"
					>
						<span class="xs:text-md text-sm sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
							>{participationsRank}</span
						>
					</a>
				{/if}
				<p class="mt-0 text-2xl">{jacob?.participations?.toLocaleString() ?? 0}</p>
			</div>
			<h2 class="md:text-md text-sm leading-none">Contests Participated</h2>
		</div>
		<div
			class="bg-card flex w-full flex-row items-center justify-center gap-3 rounded-md p-1 text-center md:flex-col md:gap-1 md:p-2"
		>
			<p class="text-2xl">{highest[1] !== 0 ? highest[1].toLocaleString() : 'N/A'}</p>
			<h2 class="md:text-md text-sm leading-none">
				{highest[1] !== 0 ? `${highest[0]} Contest${highest[1] > 1 ? 's' : ''}` : highest[0]}
			</h2>
		</div>
	</div>
</div>
