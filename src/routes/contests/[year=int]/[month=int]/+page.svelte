<script lang="ts">
	import { page } from '$app/state';
	import Head from '$comp/head.svelte';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getSkyblockMonth, getTimeStamp } from '$lib/format';
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';
	import { Button } from '$ui/button';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let days = $derived(Object.entries(data.contests ?? {}));
	let year = $derived(data.year);
	let month = $derived(data.month);
	let monthString = $derived(getSkyblockMonth(month));

	const crumbs = $derived<Crumb[]>([
		{
			name: 'Contests',
			href: '/contests',
		},
		{
			name: 'Year ' + year,
			href: '/contests/' + year,
		},
		{
			name: monthString,
			dropdown: Array.from({ length: 12 }, (_, i) => ({
				name: getSkyblockMonth(i + 1),
				href: `/contests/${year}/${i + 1}`,
			})),
		},
	]);

	const breadcrumb = getBreadcrumb();
	$effect.pre(() => {
		breadcrumb.setOverride(crumbs);
	});
</script>

<Head title="Contests | {monthString}, Year {year}" description="View all known Jacob contests in this month!" />

<div class="flex flex-col items-center justify-center px-2">
	<div class="mb-4 mt-16 flex flex-col gap-4 text-center font-semibold">
		<h1 class="text-4xl">{monthString}, Year {year}</h1>
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
				<Button
					class="w-32 rounded-lg"
					variant="secondary"
					href="/contests/{page.params.year}/{+page.params.month - 1}">Previous</Button
				>
				<Button class="w-32 rounded-lg" variant="secondary" href="/contests/{page.params.year}/records"
					>Records</Button
				>
				<Button
					class="w-32 rounded-lg"
					variant="secondary"
					href="/contests/{page.params.year}/{+page.params.month + 1}">Next</Button
				>
			</div>
		</div>
	</div>

	{#if !days.length}
		<h3 class="mx-4 mb-16 text-center">
			No contests found! Contest data is collected from players who have been searched on the website.
		</h3>
	{:else}
		<div class="mx-8 mb-8 flex w-full flex-wrap justify-center gap-4 md:w-[90%] lg:w-[70%]">
			{#each days as [day, contests], i (i)}
				<a
					class="flex w-20 flex-col items-center gap-1 rounded-lg bg-primary-foreground p-2 text-center"
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

	<div class="mb-16 grid grid-cols-3 items-center gap-1 text-center">
		{#each Array.from({ length: 12 }, (_, i) => i + 1) as i}
			<Button
				variant="secondary"
				class="w-40 whitespace-nowrap rounded-lg {i === month ? 'ring-2' : ''}"
				href="/contests/{page.params.year}/{i}"
			>
				{getSkyblockMonth(i)}
			</Button>
		{/each}
	</div>
</div>
