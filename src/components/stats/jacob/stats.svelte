<script lang="ts">
	import { PROPER_CROP_NAME } from '$lib/constants/crops';
	import type { JacobData } from '$lib/skyblock';

	export let jacob: JacobData;

	let firstPlaces = 0;

	let highestNumber = 0;
	let highest = 'No Contests Yet';
	for (const crop in jacob.contests) {
		const contests = jacob.contests[crop as keyof typeof jacob.contests];

		if (contests.length > highestNumber) {
			highest = PROPER_CROP_NAME[crop] ?? 'No Contests Yet';
			highestNumber = contests.length;
		}

		for (const contest of contests) {
			if (contest.position === 0) {
				firstPlaces++;
			}
		}
	}
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
			<p class="text-2xl">{jacob.participations.toLocaleString()}</p>
			<h2 class="text-sm md:text-md">Contests Participated</h2>
		</div>
		<div
			class="flex flex-row md:flex-col justify-center items-center gap-3 md:gap-1 p-1 md:p-2 rounded-md text-center w-full bg-gray-200 dark:bg-zinc-700"
		>
			<p class="text-2xl">{highestNumber !== 0 ? highestNumber.toLocaleString() : 'N/A'}</p>
			<h2 class="text-sm md:text-md">
				{highestNumber !== 0 ? `${highest} Contest${highestNumber > 1 ? 's' : ''}` : highest}
			</h2>
		</div>
	</div>
</div>
