<script lang="ts">
	import { PROPER_CROP_NAME } from '$lib/constants/crops';
	import type { components } from '$lib/eliteapi/api';

	export let jacob: components['schemas']['JacobDataDto'] | undefined;

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
	).reduce((acc, [crop, count]) => {
		if (count > acc[1]) {
			acc[0] = crop;
			acc[1] = count;
		}
		return acc;
	}, ['', 0]);
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
			class="flex flex-row md:flex-col justify-center items-center gap-3 md:gap-1 p-1 md:p-2 rounded-md text-center w-full bg-gray-200 dark:bg-zinc-700"
		>
			<p class="text-2xl">{jacob?.participations?.toLocaleString() ?? 0}</p>
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
