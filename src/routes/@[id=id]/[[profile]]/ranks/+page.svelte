<script lang="ts">
	import Head from '$comp/head.svelte';
	import RanksList from '$comp/stats/ranks/ranks-list.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';

	let { data } = $props();

	const ctx = getStatsContext();
	const ranks = $derived(
		Object.entries(ctx.ranks).sort(([, a], [, b]) => {
			if (a.rank === b.rank) return a.amount < b.amount ? -1 : 1;
			return a.rank < b.rank ? -1 : 1;
		})
	);
</script>

<Head title="{ctx.ignMeta} | Ranks" description="See this player's leaderboard ranks in Hypixel Skyblock!" />

<div class="mx-2 flex flex-col items-center">
	<RanksList leaderboards={data.cache.leaderboards} />
	<div class="flex w-full max-w-3xl flex-col items-center gap-4">
		{#each ranks as [id, rank] (id)}
			{@render lbRank(id, rank)}
		{/each}
	</div>
</div>

{#snippet lbRank(id: string, rank: (typeof ranks)[number][1])}
	<a
		class="bg-card flex w-full flex-row items-center justify-between gap-2 rounded-lg border-2 p-3"
		href="/leaderboard/{id}/{ctx.ign}-{ctx.selectedProfile?.profileName ?? ''}"
	>
		<div class="flex flex-col items-start gap-2">
			<p class="text-lg font-semibold">
				{rank.title}
			</p>
			<p>{rank.amount.toLocaleString()}</p>
		</div>
		<div>
			<p class="text-2xl">
				#{rank.rank}
			</p>
		</div>
	</a>
{/snippet}
