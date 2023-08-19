<script lang="ts">
	import { page } from '$app/stores';
	import Head from '$comp/head.svelte';
	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import { getTimeStamp } from '$lib/format';

	$: year = +$page.params.year;
</script>

<Head title="Record Contest Scores | Year {year}" description="View the top scores of the Skyblock year!" />

<main class="flex flex-col items-center justify-center">
	<div class="font-semibold text-center mt-16 mb-4 flex flex-col items-center gap-4">
		<h1 class="text-4xl">Contest Records - Year {year}</h1>
		<p>
			{new Date(getTimeStamp(+year - 1, 0, 0) * 1000).toLocaleDateString() +
				' - ' +
				new Date(getTimeStamp(+year, 0, 0) * 1000).toLocaleDateString()}
		</p>
		<Cropselector />
		<div class="flex flex-col md:flex-row justify-center gap-2 md:gap-4 mb-2 w-full">
			<a class="flex-1 bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg" href="/contests/{year - 1}/records"
				>Previous</a
			>
			<a class="flex-1 bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg" href="/contests/{year}">View&nbsp;Year</a>
			<a class="flex-1 bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg" href="/contests/{year + 1}/records">Next</a>
		</div>
	</div>

	<div class="flex flex-wrap md:flex-row w-full md:w-[90%] gap-4 mt-4 mx-8 mb-16 justify-center">
		<slot />
	</div>

	<div class="max-w-xl mb-8 text-center text-sm flex flex-col gap-4">
		<p>Each player can only hold one position per profile, per crop.</p>
		<p><strong>???</strong> - The player hasn't claimed this contest yet, their true position is unknown.</p>
		<p>
			<strong>Disclaimer:</strong> These contest participations are collected when a players profile is loaded on the
			website, they aren't automatically scraped. Crops may be missing if no one known to the website has participated
			in the contest, or their profile hasn't been loaded since.
		</p>
	</div>
</main>
