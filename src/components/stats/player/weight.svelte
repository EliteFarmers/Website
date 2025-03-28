<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import Profiles from './profiles.svelte';

	const ctx = getStatsContext();

	const weightInfo = $derived(ctx.member.farmingWeight);
	const rank = $derived(ctx.ranks?.farmingweight?.rank ?? -1);
	const rankText = $derived(rank !== -1 ? `#${rank}` : 'Unranked');
	const weightStr = $derived(weightInfo?.totalWeight?.toLocaleString() ?? '0');
</script>

<div class="block">
	<div class="z-10 flex items-center gap-2">
		{#if rank !== -1}
			<a
				class="max-w-fit rounded-md bg-card p-1 hover:bg-muted lg:p-1"
				href="/leaderboard/farmingweight/{ctx.ign}-{ctx.selectedProfile?.profileName}"
			>
				<span class="mx-1 font-mono text-2xl font-semibold text-completed">
					<span class="mr-0.5 text-lg">#</span>{rank}
				</span>
			</a>
		{:else}
			<div class="max-w-fit rounded-md bg-card p-1 lg:p-2">
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
