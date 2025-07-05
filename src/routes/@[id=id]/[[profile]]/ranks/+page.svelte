<script lang="ts">
	import Head from '$comp/head.svelte';
	import RanksList from '$comp/stats/ranks/ranks-list.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';

	let { data } = $props();

	const ctx = getStatsContext();
</script>

<Head title="{ctx.ignMeta} | Ranks" description="See this player's leaderboard ranks in Hypixel Skyblock!" />

<div class="mb-16 flex flex-col items-center gap-8">
	<h1 class="mt-4 max-w-2xl self-center text-center text-4xl">Leaderboard Ranks</h1>
	<RanksList leaderboards={data.cache.leaderboards} />
	<p class="text-muted-foreground max-w-lg text-center">
		Only leaderboards where this player has reached the minimum required score will be shown. If you want to see all
		leaderboards, you can check out the
		<a href="/leaderboard" class="text-link hover:underline">leaderboard</a>
		page!
	</p>
</div>
