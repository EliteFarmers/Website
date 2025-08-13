<script lang="ts">
	import { enhance } from '$app/forms';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Head from '$comp/head.svelte';
	import Entry from '$comp/leaderboards/entry.svelte';
	import PlayerSearch from '$comp/player-search.svelte';
	import type { LeaderboardEntry } from '$lib/api/elite';
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { Button } from '$ui/button';
	import { Switch } from '$ui/switch';
	import Search from '@lucide/svelte/icons/search';
	import { PersistedState } from 'runed';
	import { tick } from 'svelte';
	import type { PageData } from './$types';
	import IntervalSelect from './interval-select.svelte';
	import LeaderboardFilter from './leaderboard-filter.svelte';
	import LeaderboardPagination from './leaderboard-pagination.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let showLeaderboardName = new PersistedState('showleaderboardname', false);

	let title = $derived(`${data.lb?.title}${data.leaderboard.suffix} Leaderboard`);
	let entries = $derived(data.lb?.entries ?? []);
	let offset = $derived((data.lb?.offset ?? 0) + 1);

	let firstHalf = $derived(entries.slice(0, Math.ceil(entries.length / 2)) as LeaderboardEntry[]);
	let secondHalf = $derived(entries.slice(Math.ceil(entries.length / 2)) as LeaderboardEntry[]);

	const topTen = $derived(
		entries
			.slice(0, 10)
			.map((entry, i) => `${i + offset}. ${entry.ign} - ${entry.amount?.toLocaleString()}`)
			.join('\n')
	);

	// Scroll back down to the buttons after navigating to prevent page jumping
	afterNavigate(({ from }) => {
		if (!from?.url.pathname.startsWith('/leaderboard/')) return;
		(document.querySelector('#navigate') as HTMLAnchorElement)?.focus();
	});

	const crumbs = $derived<Crumb[]>([
		{
			name: 'LB',
			href: '/leaderboard',
		},
		{
			name: data.settings.title || title,
		},
	]);

	const breadcrumb = getPageCtx();
	const favorites = getFavoritesContext();

	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
		favorites.setPage({
			name: `#${offset} - ` + (data.settings.title || data.lb?.title),
			href: page.url.pathname,
		});
	});

	let searchForm = $state<HTMLFormElement | null>(null);
	let searchInput = $state('');
	let loading = $state(false);
	let searchOpen = $state(false);
</script>

<Head {title} description="{title} for Hypixel Skyblock.\n\n{topTen}" />

<section class="mt-16 flex w-full flex-col justify-center">
	<h1 class="mt-8 mb-16 max-w-2xl self-center text-center text-4xl">{title}</h1>
	<div class="my-2 flex flex-col items-end justify-center gap-2 rounded-lg lg:h-16 lg:flex-row">
		<div class="flex w-full flex-col items-center gap-2 lg:items-end">
			<div class="flex w-full max-w-xl flex-row items-center justify-center gap-2 md:justify-start">
				<form
					method="post"
					action={page.url.search}
					bind:this={searchForm}
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							await update();
							loading = false;
						};
					}}
				>
					<input type="hidden" name="player" value={searchInput} />
					<Button
						class="size-8"
						variant="outline"
						onclick={() => {
							searchOpen = true;
						}}
					>
						<Search size={16} />
					</Button>
					<PlayerSearch
						useButton={false}
						bind:search={searchInput}
						bind:open={searchOpen}
						cmd={() => {
							tick().then(() => {
								if (loading) return;
								searchForm?.requestSubmit();
							});
						}}
					/>
				</form>
				<IntervalSelect leaderboard={data.lb} />
				<LeaderboardFilter
					query="mode"
					title="Game Mode"
					options={[
						{ label: 'Classic', value: 'classic' },
						{ label: 'Ironman', value: 'ironman' },
						{ label: 'Stranded', value: 'island' },
					]}
				/>
				<!-- <LeaderboardFilter query="removed" title="Removed" options={[
					{ label: 'Removed Players', value: '1' },
					{ label: 'All Players', value: '2' },
				]} /> -->
			</div>
		</div>
		<div class="flex w-full flex-col items-center gap-2 lg:items-start">
			<div class="flex w-full max-w-xl justify-center md:justify-start lg:justify-end">
				<LeaderboardPagination info={data.leaderboard} leaderboard={data.lb} />
			</div>
		</div>
	</div>
	<div
		data-sveltekit-preload-data="tap"
		class="mb-2 flex flex-col justify-center gap-2 rounded-lg align-middle lg:flex-row"
	>
		<div class="flex w-full flex-col items-center gap-2 lg:items-end">
			{#each firstHalf as entry, i (entry)}
				<Entry
					rank={i + offset}
					{entry}
					leaderboard={data.leaderboard}
					showLeaderboardName={showLeaderboardName.current}
				/>
			{/each}
		</div>
		<div class="flex w-full flex-col items-center gap-2 lg:items-start">
			{#each secondHalf as entry, i (entry)}
				<Entry
					rank={i + firstHalf.length + offset}
					{entry}
					leaderboard={data.leaderboard}
					showLeaderboardName={showLeaderboardName.current}
				/>
			{/each}
		</div>
	</div>
	{#if !data.lb.entries.length}
		<div class="mb-8 flex flex-row items-center justify-center">
			<p class="text-muted-foreground w-full max-w-4xl rounded-lg border-2 py-16 text-center">
				No entries found!
			</p>
		</div>
	{:else}
		<div class="flex flex-col items-end justify-center gap-2 rounded-lg lg:flex-row">
			<div class="flex w-full flex-col items-center gap-2 lg:items-end"></div>
			<div class="flex w-full flex-col items-center gap-2 lg:items-start">
				<div class="flex w-full max-w-xl justify-center md:justify-start lg:justify-end">
					<LeaderboardPagination info={data.leaderboard} leaderboard={data.lb} />
				</div>
			</div>
		</div>
	{/if}

	<div class="mt-8 flex flex-row items-center justify-center gap-2">
		<p class="text-sm leading-none">Show Leaderboard Name In Entries</p>
		<Switch bind:checked={showLeaderboardName.current} />
	</div>

	{#if data.lb.interval}
		<p class="mx-auto w-1/2 py-4 text-center text-sm">
			Leaderboards on an interval work by saving an initial score the first time a player's data is pulled for an
			interval, then using the difference between their current score and the initial score for their score shown
			here. High scores on these leaderboards may be due to minions or other factors. A player must have reached
			the minimum amount of
			<strong>{data.lb.minimumScore.toLocaleString()}</strong> to have their initial score saved.
		</p>
	{:else}
		<p class="mx-auto w-1/2 py-4 text-center text-sm">
			This leaderboard only consists of the top players who have been searched on this website and have hit the
			minimum score of <strong>{data.lb.minimumScore.toLocaleString()}</strong>.
		</p>
	{/if}
</section>
