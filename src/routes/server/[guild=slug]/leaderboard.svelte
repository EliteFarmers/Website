<script lang="ts">
	import type { components } from '$lib/api/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getReadableSkyblockDate } from '$lib/format';
	import Jacobentry from './jacobentry.svelte';

	export let leaderboard: components['schemas']['PublicJacobLeaderboardDto'];

	$: crops = Object.entries(leaderboard.crops ?? {}).filter(([, v]) => v.length > 0);
</script>

<div class="flex flex-col items-center gap-4 p-6 bg-primary-foreground rounded-md">
	<h4 class="text-3xl font-semibold my-4">{leaderboard.title}</h4>
	<div class="flex flex-wrap justify-center">
		{#each crops as [crop, records]}
			<div class="flex basis-64 xl:basis-96 p-2 flex-col m-1 md:m-2 gap-1 md:gap-2 bg-card rounded-md">
				<div class="flex flex-row gap-2 items-center">
					<img class="pixelated w-12" src={PROPER_CROP_TO_IMG[records[0].record?.crop ?? crop]} alt={crop} />
					<h5 class="text-xl font-semibold first-letter:capitalize">{records[0].record?.crop ?? crop}</h5>
				</div>
				{#each records as record}
					<Jacobentry {record} />
				{/each}
			</div>
		{/each}
		{#if crops.length === 0}
			<p class="text-xl font-semibold mb-4">No Entries Yet!</p>
		{/if}
	</div>
	<div>
		<p>
			<span class="font-semibold">Contests Starting From:</span>
			{leaderboard.startCutoff === -1
				? 'Beginning of SkyBlock'
				: getReadableSkyblockDate(leaderboard.startCutoff ?? 0)}
		</p>
		{#if leaderboard.endCutoff !== -1}
			<p>
				<span class="font-semibold">End:</span>
				{leaderboard.endCutoff === -1 ? 'Not Set' : getReadableSkyblockDate(leaderboard.endCutoff ?? 0)}
			</p>
		{/if}
	</div>
</div>
