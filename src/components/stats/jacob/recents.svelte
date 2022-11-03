<script lang="ts">
	import type { ContestData, JacobContest } from '$lib/skyblock';
	import Contest from '$comp/stats/jacob/contest.svelte';

	export let contests: ContestData;

	// const { cactus, carrot, cocoa, melon, mushroom, nether_wart, potato, pumpkin, sugar_cane, wheat } = contests;

	type JacobContestCrop = JacobContest & { crop: string };
	let recentContests: JacobContestCrop[] = [];

	// Get the 10 most recent contests, by looking through each crop array
	// and finding the most recent contest.
	for (const [crop, arrays] of Object.entries(contests)) {
		recentContests.push(
			...arrays.slice(-10).map((c) => {
				(c as JacobContestCrop).crop = crop;
				return c as JacobContestCrop;
			})
		);
	}

	recentContests.sort((a, b) => b.timestamp - a.timestamp);
	recentContests = recentContests.slice(0, 10);

	let showMore = false;
</script>

<div class="flex flex-col gap-2 my-4">
	<h1 class="text-2xl">Recent Contests</h1>
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
		{#if recentContests.length < 1}
			<h1 class="text-lg">No recent contests found.</h1>
		{/if}
		{#each recentContests as contest, i (`${contest.crop}${contest.timestamp}`)}
			{#if i < 3 || (showMore && i < 9)}
				<div class="block">
					<Contest {contest} />
				</div>
			{:else if i < 6}
				<div class="hidden sm:block">
					<Contest {contest} />
				</div>
			{:else if i < 9}
				<div class="hidden lg:block">
					<Contest {contest} />
				</div>
			{:else if showMore}
				<div class="block lg:hidden">
					<Contest {contest} />
				</div>
			{/if}
		{/each}
	</div>
	<button class="block lg:hidden rounded-md p-3 bg-gray-200 dark:bg-zinc-700" on:click={() => (showMore = !showMore)}
		>Show {showMore ? 'Less' : 'More'}</button
	>
</div>
