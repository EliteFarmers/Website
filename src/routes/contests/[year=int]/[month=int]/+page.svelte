<script lang="ts">
	import { page } from '$app/stores';
	import Head from '$comp/head.svelte';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getSkyblockMonth } from '$lib/format';
	import type { PageData } from './$types';

	export let data: PageData;

	$: days = Object.entries(data.contests ?? {});
	$: year = data.year;
	$: month = data.month;
</script>

<Head
	title="Contests | {getSkyblockMonth(month)}, Year {year}"
	description="View all known Jacob contests in this month!"
/>

<main class="flex flex-col justify-center items-center px-2">
	<div class="font-semibold text-center mt-16 mb-4 flex flex-col gap-4">
		<h1 class="text-4xl">{getSkyblockMonth(month)}, Year {year}</h1>

		<div class="flex flex-col justify-center items-center gap-2 md:gap-4 my-4">
			<div class="flex flex-row gap-4">
				<a
					class="w-32 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-100 hover:dark:bg-zinc-700 p-2 rounded-lg"
					href="/contests/{$page.params.year}/{+$page.params.month - 1}">Previous</a
				>
				<a
					class="w-32 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-100 hover:dark:bg-zinc-700 p-2 rounded-lg"
					href="/contests/{$page.params.year}/{+$page.params.month + 1}">Next</a
				>
			</div>
		</div>
	</div>

	{#if !days.length}
		<h3 class="text-center mx-4">
			No contests found! Contest data is collected from players who have been searched on the website.
		</h3>
	{:else}
		<div class="flex flex-wrap gap-4 mx-8 mb-8 last:justify-center w-full md:w-[90%] lg:w-[70%]">
			{#each days as [day, contests], i (i)}
				<a
					class="flex-1 basis-16 text-center bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg gap-1 flex flex-col items-center"
					href="/contests/{year}/{month}/{day}"
				>
					<h4 class="text-lg mb-2">Day {day}</h4>
					{#each contests?.sort((a, b) => a?.crop?.localeCompare(b?.crop ?? '') ?? 0) ?? [] as crop}
						<img class="w-12 pixelated" src={PROPER_CROP_TO_IMG[crop.crop ?? '']} alt={crop.crop} title={crop.crop} />
					{/each}
				</a>
			{/each}
		</div>
	{/if}

	<div class="flex flex-row flex-wrap items-center gap-1 mb-16 text-center">
		{#each Array.from({ length: 12 }, (_, i) => i + 1) as i}
			<a
				class="flex-1 basis-1/4 {month === i
					? 'bg-gray-100 dark:bg-zinc-700'
					: 'bg-gray-200 dark:bg-zinc-800'}  hover:bg-gray-100 hover:dark:bg-zinc-700 p-2 rounded-lg whitespace-nowrap"
				href="/contests/{$page.params.year}/{i}"
			>
				{getSkyblockMonth(i)}
			</a>
		{/each}
	</div>
</main>
