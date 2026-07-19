<script lang="ts">
	import LeaderboardRankLink from '$comp/leaderboards/leaderboard-rank-link.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import Profiles from './profiles.svelte';

	const ctx = getStatsContext();

	const weightInfo = $derived(ctx.member.current?.farmingWeight);
	const rank = $derived(ctx.allRanks?.farmingweight?.rank ?? -1);
	const rankText = $derived(rank !== -1 ? `#${rank}` : 'Unranked');
	const weightStr = $derived(weightInfo?.totalWeight?.toLocaleString() ?? '0');
</script>

<div class="block">
	<div class="z-10 flex items-center gap-2">
		{#if rank !== -1}
			<LeaderboardRankLink
				class="bg-card hover:bg-muted max-w-fit rounded-md p-1 lg:p-1"
				category="farmingweight"
				player={ctx.ign}
				profile={ctx.selectedProfile?.profileName}
				{rank}
			>
				<span class="text-completed mx-1 font-mono text-2xl font-semibold">
					<span class="mr-0.5 text-lg">#</span>{rank}
				</span>
			</LeaderboardRankLink>
		{:else}
			<div class="bg-card max-w-fit rounded-md p-1 lg:p-2">
				<span class="text-md mx-1 font-semibold md:text-lg">
					{rankText}
				</span>
			</div>
		{/if}
		<Profiles />
	</div>

	<div class="object-scale-down">
		<h1 class="text-5xl md:text-6xl lg:text-8xl">{weightStr}</h1>
		<h1 class="w-full text-right text-sm md:text-lg">Farming Weight</h1>
	</div>
</div>
