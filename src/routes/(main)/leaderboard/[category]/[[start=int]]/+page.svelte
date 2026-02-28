<script lang="ts">
	import { enhance } from '$app/forms';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Countdown from '$comp/countdown.svelte';
	import Head from '$comp/head.svelte';
	import LeaderboardEntriesColumns from '$comp/leaderboards/entries-columns.svelte';
	import IntervalSelect from '$comp/leaderboards/interval-select.svelte';
	import PlayerSearch from '$comp/player-search.svelte';
	import DateDisplay from '$comp/time/date-display.svelte';
	import { formatLeaderboardAmount } from '$lib/format';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import { getLeaderboardSlice } from '$lib/remote';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { Button } from '$ui/button';
	import Skeleton from '$ui/skeleton/skeleton.svelte';
	import { Switch } from '$ui/switch';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import Hourglass from '@lucide/svelte/icons/hourglass';
	import Search from '@lucide/svelte/icons/search';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import SquareActivity from '@lucide/svelte/icons/square-activity';
	import { PersistedState } from 'runed';
	import { tick } from 'svelte';
	import type { PageData } from './$types';
	import LeaderboardFilter from './leaderboard-filter.svelte';
	import LeaderboardPagination from './leaderboard-pagination.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let showLeaderboardName = new PersistedState('showleaderboardname', true);
	const leaderboardQuery = $derived(data.params ? getLeaderboardSlice(data.params) : null);
	const lb = $derived(data.lb ?? leaderboardQuery?.current);
	const loading = $derived(leaderboardQuery ? leaderboardQuery.loading : false);

	let title = $derived(`${lb?.title}${data.leaderboard.suffix} Leaderboard`);
	let entries = $derived(lb?.entries ?? []);
	let offset = $derived((lb?.offset ?? 0) + 1);
	let intervalType = $derived(
		lb?.id.endsWith('-monthly') ? 'monthly' : lb?.id.endsWith('-weekly') ? 'weekly' : 'current'
	);

	const topTen = $derived(
		entries
			.slice(0, 10)
			.map(
				(entry, i) =>
					`${i + offset}. ${entry.ign ?? entry.members?.at(0)?.ign ?? 'N/A'} - ${formatLeaderboardAmount(data.leaderboard, entry.amount)}`
			)
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
	const gbl = getGlobalContext();

	let startTime = $derived(Number(lb?.startsAt ?? 0) * 1000);
	let endTime = $derived(Number(lb?.endsAt ?? 0) * 1000);
	let active = $derived(endTime > Date.now());

	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
		favorites.setPage({
			name: `#${offset} - ` + (data.settings.title || lb?.title),
			href: page.url.pathname,
		});
	});

	let searchForm = $state<HTMLFormElement | null>(null);
	let searchInput = $state('');
	let searchLoading = $state(false);
	let searchOpen = $state(false);
</script>

<Head
	{title}
	description="{title} for Hypixel Skyblock.\n\n{topTen}"
	canonicalPath="/leaderboard/{data.leaderboard.id}{lb?.offset ? `/${lb.offset + 1}` : ''}"
/>

<section class="mt-16 flex w-full flex-col justify-center">
	<div
		class="mt-8 flex w-full flex-col items-center justify-center gap-2 {startTime && endTime ? 'mb-6.5' : 'mb-22'}"
	>
		{#if loading}
			<Skeleton class="mb-4 h-10 w-full max-w-2xl rounded-lg" />
		{:else}
			<h1 class="mb-4 max-w-2xl self-center text-center text-4xl">{title}</h1>
		{/if}
		{#if startTime && endTime}
			<div class="flex flex-row items-center text-sm md:text-base {active ? '' : 'mb-10'}">
				<DateDisplay timestamp={startTime} />
				<ArrowRight class="mx-2 inline-block size-4" />
				<DateDisplay timestamp={endTime} />
			</div>
		{/if}
		{#if active}
			<div class="flex h-8 flex-row items-center gap-2">
				<Countdown start={startTime} end={endTime} class="gap-2 text-sm md:text-base">
					{#snippet ending()}
						<p class="text-muted-foreground mb-0.5 text-sm leading-none whitespace-nowrap md:text-base">
							Ending in
						</p>
					{/snippet}
				</Countdown>
			</div>
		{/if}
	</div>

	<div class="my-2 flex flex-col items-end justify-center gap-2 rounded-lg lg:h-16 lg:flex-row">
		<div class="flex w-full flex-col items-center gap-2 lg:items-end">
			<div class="flex w-full max-w-xl flex-row flex-wrap items-center justify-center gap-2 md:justify-start">
				<form
					method="post"
					action={page.url.search}
					bind:this={searchForm}
					use:enhance={() => {
						searchLoading = true;
						return async ({ update }) => {
							await update();
							searchLoading = false;
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
						disabled={loading || searchLoading}
					>
						<Search size={16} />
					</Button>
					<PlayerSearch
						useButton={false}
						bind:search={searchInput}
						bind:open={searchOpen}
						cmd={() => {
							tick().then(() => {
								if (searchLoading) return;
								searchForm?.requestSubmit();
							});
						}}
					/>
				</form>
				{#if lb}
					<IntervalSelect leaderboard={lb} />
				{/if}
				<LeaderboardFilter
					query="mode"
					title="Game Mode"
					disabled={loading}
					options={[
						{ label: 'Classic', value: 'classic' },
						{ label: 'Ironman', value: 'ironman' },
						{ label: 'Stranded', value: 'island' },
					]}
				/>
				{#if data.leaderboard.intervals?.length && data.leaderboard.intervals.length > 1}
					{#each data.leaderboard.intervals as interval (interval)}
						{#if interval !== intervalType}
							<Button
								class="size-8"
								variant="outline"
								disabled={loading}
								href="/leaderboard/{data.settings.id.replace('-' + intervalType, '')}{interval ===
								'current'
									? ''
									: '-' + interval}"
							>
								{#if interval === 'monthly'}
									<CalendarClock />
								{:else if interval === 'weekly'}
									<Hourglass />
								{:else}
									<SquareActivity />
								{/if}
							</Button>
						{/if}
					{/each}
				{/if}
				<!-- <LeaderboardFilter
					query="removed"
					title="Removed"
					options={[
						{ label: 'Removed Players', value: '1' },
						{ label: 'All Players', value: '2' },
					]}
				/> -->
			</div>
		</div>
		<div class="flex w-full flex-col items-center gap-2 lg:items-start">
			<div class="flex w-full max-w-xl justify-center md:justify-start lg:justify-end">
				<LeaderboardPagination info={data.leaderboard} leaderboard={lb} {loading} />
			</div>
		</div>
	</div>
	<LeaderboardEntriesColumns
		class="mb-2"
		{entries}
		leaderboard={data.leaderboard}
		{offset}
		showLeaderboardName={showLeaderboardName.current}
		{loading}
	/>
	{#if !lb?.entries.length && !loading}
		<div class="mb-8 flex flex-row items-center justify-center">
			<p class="text-muted-foreground w-full max-w-4xl rounded-lg border-2 py-16 text-center">
				No entries found!
			</p>
		</div>
	{:else}
		<div class="flex flex-col items-end justify-center gap-2 rounded-lg lg:flex-row">
			<div class="flex w-full flex-col items-center gap-2 lg:items-end">
				{#if gbl.user?.settings.features?.hideShopPromotions !== true}
					<div class="flex w-full max-w-xl flex-row items-center justify-center lg:justify-start">
						<Button
							href="/shop"
							variant="outline"
							class="relative flex flex-row items-center gap-2 overflow-hidden text-sm"
						>
							<div class="bg-primary/15 absolute -top-24 -right-24 h-32 w-32 rounded-full blur-xl"></div>
							<div
								class="bg-primary/10 absolute -bottom-24 -left-24 h-32 w-32 rounded-full blur-xl"
							></div>
							<ShoppingCart class="size-4" />
							Buy Cosmetics!
						</Button>
					</div>
				{/if}
			</div>
			<div class="flex w-full flex-col items-center gap-2 lg:items-start">
				<div class="flex w-full max-w-xl justify-center md:justify-start lg:justify-end">
					<LeaderboardPagination info={data.leaderboard} leaderboard={lb} {loading} />
				</div>
			</div>
		</div>
	{/if}

	<div class="mt-8 flex flex-row items-center justify-center gap-2">
		<p class="text-sm leading-none">Show Leaderboard Name In Entries</p>
		<Switch bind:checked={showLeaderboardName.current} />
	</div>

	{#if lb?.interval}
		<p class="mx-auto max-w-lg py-4 text-center text-sm">
			Leaderboards on an interval work by saving an initial score the first time a player's data is pulled for an
			interval, then using the difference between their current score and the initial score for their score shown
			here. High scores on these leaderboards may be due to minions or other factors. A player must have reached
			the minimum amount of
			<strong>{formatLeaderboardAmount(data.leaderboard, lb?.minimumScore ?? 0)}</strong> to have their initial score
			saved.
		</p>
	{:else}
		<p class="mx-auto max-w-lg py-4 text-center text-sm">
			This leaderboard only consists of the top players who have been searched on this website and have hit the
			minimum score of <strong>{formatLeaderboardAmount(data.leaderboard, lb?.minimumScore ?? 0)}</strong>.
		</p>
	{/if}
</section>
