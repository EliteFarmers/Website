<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Entry from '$comp/leaderboards/entry.svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import Head from '$comp/head.svelte';
	import type { LeaderboardEntry } from '$lib/api/elite';
	import * as Pagination from '$ui/pagination';
	import { Switch } from '$comp/ui/switch';
	import { getShowLeaderboardName } from '$lib/stores/leaderboardName';

	export let data: PageData;

	$: includeLeaderboardName = getShowLeaderboardName();

	$: title = `${data.lb?.title} Leaderboard`;
	$: entries = data.lb?.entries ?? [];
	$: offset = (data.lb?.offset ?? 0) + 1;
	$: category = data.category;

	$: firstHalf = entries.slice(0, Math.ceil(entries.length / 2)) as LeaderboardEntry[];
	$: secondHalf = entries.slice(Math.ceil(entries.length / 2)) as LeaderboardEntry[];
	$: formatting = data.formatting;

	$: initialPage = Math.floor((data.lb.offset ?? 0) / 20 + 1);
	$: noneActive = (data.lb.offset ?? 0) / 20 + 1 !== initialPage;

	$: {
		if (data.lb?.id === 'skyblockxp') {
			entries = entries.map((entry) => ({
				ign: entry.ign,
				uuid: entry.uuid,
				profile: entry.profile,
				amount: (entry.amount ?? 0) / 100,
			}));
		}
	}

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
</script>

<Head {title} description={`${title} for Hypixel Skyblock.`} />

<section class="flex flex-col mt-16 justify-center w-full">
	<h1 class="text-4xl text-center mt-8 mb-16 max-w-md self-center">{title}</h1>
	<div class="flex w-full justify-center gap-4 text-center">
		<Pagination.Root
			count={data.lb.maxEntries ?? 1000}
			perPage={20}
			bind:page={initialPage}
			let:pages
			onPageChange={(newPage) => {
				goto(`/leaderboard/${category}/${(newPage - 1) * 20 + 1}`);
			}}
		>
			<Pagination.Content class="flex justify-center">
				<div class="flex flex-row justify-end order-1 basis-1/3 sm:basis-auto">
					<Pagination.Item>
						<Pagination.PrevButton />
					</Pagination.Item>
				</div>
				<div class="flex flex-wrap items-center order-3 sm:order-2 justify-center flex-grow sm:flex-auto">
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
									on:click={() => samePageClick(page.value)}
								>
									{Math.floor(page.value)}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
				</div>
				<div class="flex flex-row justify-start order-2 sm:order-last basis-1/3 sm:basis-auto">
					<Pagination.Item>
						<Pagination.NextButton />
					</Pagination.Item>
				</div>
			</Pagination.Content>
		</Pagination.Root>
	</div>
	<div
		data-sveltekit-preload-data="tap"
		class="flex flex-col lg:flex-row justify-center align-middle rounded-lg mb-8 mt-2 mx-4"
	>
		<div class="flex flex-col gap-2 p-2 w-full items-center lg:items-end">
			{#each firstHalf as entry, i (entry)}
				<Entry
					rank={i + offset}
					{entry}
					{formatting}
					leaderboard={data.leaderboard}
					showLeaderboardName={$includeLeaderboardName}
				/>
			{/each}
		</div>
		<div class="flex flex-col gap-2 p-2 pt-0 lg:pt-2 w-full items-center lg:items-start">
			{#each secondHalf as entry, i (entry)}
				<Entry
					rank={i + firstHalf.length + offset}
					{entry}
					{formatting}
					leaderboard={data.leaderboard}
					showLeaderboardName={$includeLeaderboardName}
				/>
			{/each}
		</div>
	</div>
	<div class="flex flex-row items-center justify-center gap-2">
		<p class="text-sm leading-none">Show Leaderboard Name In Entries</p>
		<Switch bind:checked={$includeLeaderboardName} />
	</div>
	<p class="text-sm text-center w-1/2 mx-auto py-4">
		This leaderboard only consists of the top {$page.data.leaderboard.limit.toLocaleString()} players who have been searched
		on this website. New entries are recalculated every 30 minutes.
	</p>
</section>
