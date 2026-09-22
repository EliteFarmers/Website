<script lang="ts">
	import LeaderboardRankLink from '$comp/leaderboards/leaderboard-rank-link.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { GARDEN_VISITORS, compareRarity, groupGardenVisitors, type GardenVisitorStats } from 'farming-weight';
	import Visitor from './visitor.svelte';

	const ctx = getStatsContext();
	const garden = $derived(ctx.garden);

	let visitors = $derived(groupGardenVisitors((garden?.visitors ?? {}) as Record<string, GardenVisitorStats>));
	let groups = $derived(Object.entries(visitors).sort(([a], [b]) => compareRarity(b, a)));

	const maxVisitors = $derived(Object.keys(GARDEN_VISITORS).length);
	const totalVisits = $derived(
		Object.values(garden?.visitors ?? {}).reduce((acc, { visits = 0 }) => acc + visits, 0) ?? 0
	);
	const accepted = $derived(garden?.completedVisitors ?? 0);
	const rejected = $derived(totalVisits - accepted);
	const rate = $derived(((accepted / totalVisits) * 100).toFixed(2));
	const ranks = $derived(ctx.ranks);
</script>

<div class="flex w-full flex-col gap-2 rounded-md bg-background p-3 text-foreground">
	<h3 class="text-xl leading-none font-semibold">Visitors</h3>
	<div class="flex max-w-lg flex-wrap gap-2 text-lg sm:flex-row">
		<div class="flex flex-row items-center gap-1 rounded-md bg-card p-1 px-2 text-card-foreground">
			Unique • <span class="font-semibold">{(garden?.uniqueVisitors ?? 0).toLocaleString()}</span>/{maxVisitors}
		</div>
		<div class="flex flex-row items-center gap-1 rounded-md bg-card p-1 px-2 text-card-foreground">
			Total Visits • <span class="font-semibold">{totalVisits.toLocaleString()}</span>
		</div>
		<div class="flex flex-row items-center gap-1 rounded-md bg-card p-1 px-2 text-card-foreground">
			{#if ranks['visitors-accepted']?.rank > 0}
				<LeaderboardRankLink
					category="visitors-accepted"
					player={ctx.ign}
					profile={ctx.selectedProfile?.profileName}
					rank={ranks['visitors-accepted']?.rank ?? -1}
					class="rounded-md bg-card px-1.5 text-card-foreground hover:bg-muted"
				>
					<span class="text-sm">#</span><span class="text-md">{ranks['visitors-accepted']?.rank}</span>
				</LeaderboardRankLink> •
			{/if}
			Accepted • <span class="font-semibold">{accepted.toLocaleString()}</span>
		</div>
		<div class="flex flex-row items-center gap-1 rounded-md bg-card p-1 px-2 text-card-foreground">
			Rejected • <span class="font-semibold">{rejected.toLocaleString()}</span>
		</div>
		<div class="flex flex-row items-center gap-1 rounded-md bg-card p-1 px-2 text-card-foreground">
			Acceptance Rate • <span class="font-semibold">{rate}%</span>
		</div>
	</div>
	<div class="flex flex-wrap gap-1">
		{#each groups as [rarity, list] (rarity)}
			{#each list as visitor (visitor.name)}
				<Visitor {visitor} />
			{/each}
		{/each}
	</div>
</div>
