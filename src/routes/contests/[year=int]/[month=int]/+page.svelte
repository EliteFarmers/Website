<script lang="ts">
	import { page } from '$app/stores';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getSkyblockMonth } from '$lib/format';
	import type { PageData } from './$types';

	export let data: PageData;

	$: days = Object.entries(data.contests ?? {});
	$: year = data.year;
	$: month = data.month;
</script>

<main class="flex flex-col justify-center items-center">
	<div class="font-semibold text-center mt-16 mb-4 flex flex-col gap-4">
		<h1 class="text-4xl">{getSkyblockMonth(month)}, Year {year}</h1>

		<div class="flex flex-col md:flex-row justify-center gap-2 md:gap-4 my-4">
			<a
				class="flex-1 bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg"
				href="/contests/{$page.params.year}/{+$page.params.month - 1}">Previous</a
			>
			<a
				class="flex-1 bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg"
				href="/contests/{$page.params.year}">View&nbsp;Year</a
			>
			<a
				class="flex-1 bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg"
				href="/contests/{$page.params.year}/{+$page.params.month + 1}">Next</a
			>
		</div>
	</div>

	{#if !days.length}
		<h3 class="text-center mx-4">No contests found! Contest data is collected from players who have been searched on the website.</h3>
	{:else}
		<div class="flex flex-wrap gap-4 mx-4 mb-16 justify-center w-full md:w-[90%] lg:w-[70%]">
			{#each days as [day, contests], i (i)}
				<a
					class="flex-1 text-center bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg gap-1 flex flex-col items-center"
					href="/contests/{year}/{month}/{day}"
				>
					<h4 class="text-lg mb-2">Day {day}</h4>
					{#each contests?.sort((a, b) => a?.crop?.localeCompare(b?.crop ?? '') ?? 0) ?? [] as crop}
						<img class="w-12" src={PROPER_CROP_TO_IMG[crop.crop ?? '']} alt="{crop.crop}" title={crop.crop}>
					{/each}
				</a>
			{/each}
		</div>
	{/if}
</main>

<style lang="postcss">
	img {
		image-rendering: pixelated;
	}
</style>