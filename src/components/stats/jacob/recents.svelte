<script lang="ts">
	import { page } from '$app/stores';
	import Contest from '$comp/stats/jacob/contest.svelte';
	import type { components } from '$lib/api/api';
	import { ArrowUpRightFromSquareOutline } from 'flowbite-svelte-icons';

	export let contests: components['schemas']['JacobDataDto']['contests'];

	$: recentContests = contests?.sort((a, b) => (b?.timestamp ?? 0) - (a?.timestamp ?? 0)).slice(0, 8) ?? [];

	let showMore = false;
</script>

<div class="flex flex-col">
	<h1 class="text-2xl my-1">Recent Contests</h1>
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
		<a
			href={$page.url.pathname + '/contests'}
			data-sveltekit-preload-data="off"
			class="p-2 flex flex-row items-center justify-center hover:shadow-lg hover:bg-gray-200 dark:hover:bg-zinc-700 gap-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 border-l-4"
		>
			<h3 class="text-lg font-semibold flex flex-row items-center gap-2">
				View all
				<ArrowUpRightFromSquareOutline />
			</h3>
		</a>
	</div>
</div>
