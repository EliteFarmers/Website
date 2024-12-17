<script lang="ts">
	import { page } from '$app/state';
	import Head from '$comp/head.svelte';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getSkyblockMonth, getTimeStamp } from '$lib/format';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let days = $derived(Object.entries(data.contests ?? {}));
	let year = $derived(data.year);
	let month = $derived(data.month);
</script>

<Head
	title="Contests | {getSkyblockMonth(month)}, Year {year}"
	description="View all known Jacob contests in this month!"
/>

<main class="flex flex-col items-center justify-center px-2">
	<div class="mb-4 mt-16 flex flex-col gap-4 text-center font-semibold">
		<h1 class="text-4xl">{getSkyblockMonth(month)}, Year {year}</h1>
		<p>
			{new Date(getTimeStamp(+year - 1, month - 1, 0) * 1000).toLocaleString(undefined, {
				timeStyle: 'short',
				dateStyle: 'medium',
			}) +
				' - ' +
				new Date(getTimeStamp(+year - 1, month, 0) * 1000).toLocaleString(undefined, {
					timeStyle: 'short',
					dateStyle: 'medium',
				})}
		</p>
		<div class="my-4 flex flex-col items-center justify-center gap-2 md:gap-4">
			<div class="flex flex-row gap-4">
				<a
					class="w-32 rounded-lg bg-gray-200 p-2 hover:bg-gray-100 dark:bg-zinc-800 hover:dark:bg-zinc-700"
					href="/contests/{page.params.year}/{+page.params.month - 1}">Previous</a
				>
				<a
					class="w-32 rounded-lg bg-gray-200 p-2 hover:bg-gray-100 dark:bg-zinc-800 hover:dark:bg-zinc-700"
					href="/contests/{page.params.year}/records">Records</a
				>
				<a
					class="w-32 rounded-lg bg-gray-200 p-2 hover:bg-gray-100 dark:bg-zinc-800 hover:dark:bg-zinc-700"
					href="/contests/{page.params.year}/{+page.params.month + 1}">Next</a
				>
			</div>
		</div>
	</div>

	{#if !days.length}
		<h3 class="mx-4 mb-16 text-center">
			No contests found! Contest data is collected from players who have been searched on the website.
		</h3>
	{:else}
		<div class="mx-8 mb-8 flex w-full flex-wrap gap-4 last:justify-center md:w-[90%] lg:w-[70%]">
			{#each days as [day, contests], i (i)}
				<a
					class="flex flex-1 basis-16 flex-col items-center gap-1 rounded-lg bg-gray-200 p-2 text-center dark:bg-zinc-800"
					href="/contests/{year}/{month}/{day}"
				>
					<h4 class="mb-2 text-lg">Day {day}</h4>
					{#each contests?.sort((a, b) => a?.crop?.localeCompare(b?.crop ?? '') ?? 0) ?? [] as crop}
						<img
							class="pixelated w-12"
							src={PROPER_CROP_TO_IMG[crop.crop ?? '']}
							alt={crop.crop}
							title={crop.crop}
						/>
					{/each}
				</a>
			{/each}
		</div>
	{/if}

	<div class="mb-16 flex flex-row flex-wrap items-center gap-1 text-center">
		{#each Array.from({ length: 12 }, (_, i) => i + 1) as i}
			<a
				class="flex-1 basis-1/4 {month === i
					? 'bg-gray-100 dark:bg-zinc-700'
					: 'bg-gray-200 dark:bg-zinc-800'}  whitespace-nowrap rounded-lg p-2 hover:bg-gray-100 hover:dark:bg-zinc-700"
				href="/contests/{page.params.year}/{i}"
			>
				{getSkyblockMonth(i)}
			</a>
		{/each}
	</div>
</main>
