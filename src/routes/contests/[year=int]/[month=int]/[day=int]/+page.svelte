<script lang="ts">
	import { getReadableSkyblockDate } from '$lib/format';
	import type { PageData } from './$types';

	import Participation from '$comp/stats/contests/participation.svelte';
	import Head from '$comp/head.svelte';
	import { page } from '$app/stores';

	export let data: PageData;

	$: contests = data.contests;
	$: timestamp = data.timestamp;
</script>

<Head
	title="Contests | {getReadableSkyblockDate(timestamp ?? 0)}"
	description="View all known participations of these Jacob contests!"
/>

<div class="flex flex-col items-center justify-center">
	<div class="font-semibold text-center mt-16 mb-4 flex flex-col gap-4">
		<h1 class="text-4xl">{getReadableSkyblockDate(timestamp ?? 0)}</h1>

		<div class="flex flex-row justify-center gap-8 my-4">
			<a
				class="flex-1 bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg"
				href="/contests/{$page.params.year}/{$page.params.month}/{+$page.params.day - 3}">Previous</a
			>
			<a
				class="flex-1 bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg"
				href="/contests/{$page.params.year}/{$page.params.month}/{+$page.params.day + 3}">Next</a
			>
		</div>
	</div>

	{#if contests.length === 0}
		<div class="flex flex-col items-center justify-center p-4 space-y-2">
			<h2 class="text-3xl font-semibold text-center">No Contests Found</h2>
			<h4>Try a different timestamp!</h4>
			<p>Data will be loaded once a player has participated in one of these contests!</p>
		</div>
	{/if}

	<div class="flex flex-row gap-4 mt-4 mb-16">
		{#each contests as contest}
			<div class="bg-gray-100 rounded-md shadow-md dark:bg-zinc-800">
				<div class="flex flex-col flex-1 items-center justify-start p-4 space-y-2">
					<h2 class="text-3xl font-semibold text-center">
						{contest.crop ?? 'Not Found'}
					</h2>
					<h4>
						{contest.participations?.length ?? 0} / {contest.participants !== -1
							? contest.participants
							: 'Unknown'} Participants
					</h4>
					<div class="flex flex-col justify-center space-y-2">
						{#each contest.participations?.sort((a, b) => (b?.collected ?? 0) - (a?.collected ?? 0)) ?? [] as participant}
							<Participation entry={participant} />
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
