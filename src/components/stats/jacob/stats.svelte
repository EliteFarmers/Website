<script lang="ts">
	import { page } from '$app/stores';
	import type { components } from '$lib/api/api';

	export let jacob: components['schemas']['JacobDataDto'] | undefined;
	export let participationsRank = -1;

	$: firstPlaces = jacob?.contests?.filter((contest) => contest.position === 0).length ?? 0;

	// Calculate which crop has the most contests and get the count
	$: highest = Object.entries(
		jacob?.contests?.reduce((acc, contest) => {
			if (!contest?.crop) return acc;

			if (contest.crop in acc) {
				acc[contest.crop]++;
			} else {
				acc[contest.crop] = 1;
			}
			return acc;
		}, {} as Record<string, number>) ?? {}
	).reduce(
		(acc, [crop, count]) => {
			if (count > acc[1]) {
				acc[0] = crop;
				acc[1] = count;
			}
			return acc;
		},
		['', 0]
	);
</script>

<div class="flex flex-col my-4 gap-2">
	<h1 class="text-2xl">General Stats</h1>
	<div class="flex flex-col justify-center w-full md:flex-row gap-2 md:gap-4">
		<div
			class="flex flex-row md:flex-col justify-center items-center gap-3 md:gap-1 p-1 md:p-2 rounded-md text-center w-full bg-gray-200 dark:bg-zinc-700"
		>
			<p class="text-2xl">{firstPlaces.toLocaleString()}</p>
			<h2 class="text-sm md:text-md">First Place Contests</h2>
		</div>
		<div
			class="flex flex-row md:flex-col align-bottom justify-center items-center gap-3 md:gap-1 p-1 md:p-2 rounded-md text-center w-full bg-gray-200 dark:bg-zinc-700"
		>
			<div class="flex flex-row gap-2 align-bottom justify-center">
				{#if participationsRank !== -1}
					<a
						href="/leaderboard/participations/{$page.params.id}-{$page.params.profile}"
						class="px-1.5 mb-1 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 hover:dark:bg-zinc-600 flex"
					>
						<span class="text-sm xs:text-md sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl">{participationsRank}</span
						>
					</a>
				{/if}
				<p class="text-2xl mt-0">{jacob?.participations?.toLocaleString() ?? 0}</p>
			</div>
			<h2 class="text-sm md:text-md">Contests Participated</h2>
		</div>
		<div
			class="flex flex-row md:flex-col justify-center items-center gap-3 md:gap-1 p-1 md:p-2 rounded-md text-center w-full bg-gray-200 dark:bg-zinc-700"
		>
			<p class="text-2xl">{highest[1] !== 0 ? highest[1].toLocaleString() : 'N/A'}</p>
			<h2 class="text-sm md:text-md">
				{highest[1] !== 0 ? `${highest[0]} Contest${highest[1] > 1 ? 's' : ''}` : highest[0]}
			</h2>
		</div>
	</div>
</div>
