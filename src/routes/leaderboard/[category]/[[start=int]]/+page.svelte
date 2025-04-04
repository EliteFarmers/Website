<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import Entry from '$comp/leaderboards/entry.svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import Head from '$comp/head.svelte';
	import type { LeaderboardEntry } from '$lib/api/elite';
	import * as Pagination from '$ui/pagination';
	import { Switch } from '$ui/switch';
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';
	import { PersistedState } from 'runed';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let showLeaderboardName = new PersistedState('showleaderboardname', false);

	let title = $derived(`${data.lb?.title} Leaderboard`);
	let entries = $derived(data.lb?.entries ?? []);
	let offset = $derived((data.lb?.offset ?? 0) + 1);
	let category = $derived(data.category);

	let firstHalf = $derived(entries.slice(0, Math.ceil(entries.length / 2)) as LeaderboardEntry[]);
	let secondHalf = $derived(entries.slice(Math.ceil(entries.length / 2)) as LeaderboardEntry[]);
	let formatting = $derived(data.formatting);

	let initialPage = $state(Math.floor((data.lb.offset ?? 0) / 20 + 1));
	let noneActive = $derived((data.lb.offset ?? 0) / 20 + 1 !== initialPage);

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

	function samePageClick(page: number) {
		if (noneActive) {
			goto(`/leaderboard/${category}/${(page - 1) * 20 + 1}`);
		}
	}

	const crumbs = $derived<Crumb[]>([
		{
			name: 'LB',
			href: '/leaderboard',
		},
		{
			name: data.settings.title || title,
		},
	]);

	const breadcrumb = getBreadcrumb();
	const favorites = getFavoritesContext();

	$effect.pre(() => {
		breadcrumb.setOverride(crumbs);
		favorites.setPage({
			name: `#${offset} - ` + (data.settings.title || data.lb?.title),
			href: page.url.pathname,
		});
	});
</script>

<Head {title} description="{title} for Hypixel Skyblock.{'\n\n'}{topTen}" />

<section class="mt-16 flex w-full flex-col justify-center">
	<h1 class="mb-16 mt-8 max-w-md self-center text-center text-4xl">{title}</h1>
	<div class="flex w-full justify-center gap-4 text-center">
		<Pagination.Root
			count={10_000}
			perPage={20}
			bind:page={initialPage}
			onPageChange={(newPage) => {
				goto(`/leaderboard/${category}/${(newPage - 1) * 20 + 1}`);
			}}
		>
			{#snippet children({ pages })}
				<Pagination.Content class="flex justify-center">
					<div class="order-1 flex basis-1/3 flex-row justify-end sm:basis-auto">
						<Pagination.Item>
							<Pagination.PrevButton />
						</Pagination.Item>
					</div>
					<div class="order-3 flex flex-grow flex-wrap items-center justify-center sm:order-2 sm:flex-auto">
						{#each pages as page (page.key)}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link
										page={{ ...page, value: Math.floor(page.value) }}
										isActive={!noneActive && (page.value - 1) * 20 + 1 === offset}
										onclick={() => samePageClick(page.value)}
									>
										{Math.floor(page.value)}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
					</div>
					<div class="order-2 flex basis-1/3 flex-row justify-start sm:order-last sm:basis-auto">
						<Pagination.Item>
							<Pagination.NextButton />
						</Pagination.Item>
					</div>
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>
	</div>
	<div
		data-sveltekit-preload-data="tap"
		class="mx-4 mb-8 mt-2 flex flex-col justify-center rounded-lg align-middle lg:flex-row"
	>
		<div class="flex w-full flex-col items-center gap-2 p-2 lg:items-end">
			{#each firstHalf as entry, i (entry)}
				<Entry
					rank={i + offset}
					{entry}
					{formatting}
					leaderboard={data.leaderboard}
					showLeaderboardName={showLeaderboardName.current}
				/>
			{/each}
		</div>
		<div class="flex w-full flex-col items-center gap-2 p-2 pt-0 lg:items-start lg:pt-2">
			{#each secondHalf as entry, i (entry)}
				<Entry
					rank={i + firstHalf.length + offset}
					{entry}
					{formatting}
					leaderboard={data.leaderboard}
					showLeaderboardName={showLeaderboardName.current}
				/>
			{/each}
		</div>
	</div>
	<div class="flex flex-row items-center justify-center gap-2">
		<p class="text-sm leading-none">Show Leaderboard Name In Entries</p>
		<Switch bind:checked={showLeaderboardName.current} />
	</div>
	<p class="mx-auto w-1/2 py-4 text-center text-sm">
		This leaderboard only consists of the top {page.data.leaderboard.limit.toLocaleString()} players who have been searched
		on this website. New entries are recalculated every 30 minutes.
	</p>
</section>
