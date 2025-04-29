<script lang="ts">
	import type { components } from '$lib/api/api';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getReadableSkyblockDate } from '$lib/format';
	import Jacobentry from './jacobentry.svelte';

	interface Props {
		leaderboard: components['schemas']['PublicJacobLeaderboardDto'];
	}

	let { leaderboard }: Props = $props();

	let crops = $derived(Object.entries(leaderboard.crops ?? {}).filter(([, v]) => v.length > 0));
</script>

<div class="flex flex-col items-center gap-4 rounded-md border-2 bg-card p-6">
	<h4 class="my-4 text-3xl font-semibold">{leaderboard.title}</h4>
	<div class="flex flex-wrap justify-center">
		{#each crops as [crop, records], i (i)}
			<div class="m-1 flex basis-64 flex-col gap-1 rounded-md bg-card p-2 md:m-2 md:gap-2 xl:basis-96">
				<div class="flex flex-row items-center gap-2">
					<img class="pixelated w-12" src={PROPER_CROP_TO_IMG[records[0].record?.crop ?? crop]} alt={crop} />
					<h5 class="text-xl font-semibold first-letter:capitalize">{records[0].record?.crop ?? crop}</h5>
				</div>
				{#each records as record, i (i)}
					<Jacobentry {record} />
				{/each}
			</div>
		{/each}
		{#if crops.length === 0}
			<p class="mb-4 text-xl font-semibold">No Entries Yet!</p>
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
