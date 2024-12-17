<script lang="ts">
	import { page } from '$app/state';
	import Contest from '$comp/stats/jacob/contest.svelte';
	import type { components } from '$lib/api/api';

	interface Props {
		contests: components['schemas']['JacobDataDto']['contests'];
	}

	let { contests }: Props = $props();

	let recentContests = $derived(
		contests
			?.slice()
			?.sort((a, b) => (b?.timestamp ?? 0) - (a?.timestamp ?? 0))
			.slice(0, 8) ?? []
	);

	let showMore = false;
</script>

<div class="flex flex-col items-center md:items-start">
	<h1 class="my-2 text-2xl">Recent Contests</h1>
	<div class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
		{#if recentContests.length > 0}
			<a
				href={page.url.pathname + '/contests'}
				data-sveltekit-preload-data="off"
				class="flex flex-row items-center justify-center gap-0.5 rounded-md border-l-4 bg-primary-foreground p-2 hover:bg-muted hover:shadow-lg dark:border-zinc-700"
			>
				<h3 class="flex flex-row items-center gap-2 text-lg font-semibold">View all</h3>
			</a>
		{:else}
			<p class="text-lg">No contests found.</p>
		{/if}
	</div>
</div>
