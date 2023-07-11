<script lang="ts">
	import type { components } from '$lib/eliteapi/api';
	import Profiles from './profiles.svelte';

	export let weightInfo: components['schemas']['FarmingWeightDto'] | undefined;
	export let rank: number;

	export let profiles: {
		ign: string;
		selected: { id: string; name: string };
		profiles: { id: string; name: string }[];
	};

	$: rankText = rank !== -1 ? `#${rank}` : 'Unranked';

	$: weightStr = weightInfo?.totalWeight?.toLocaleString() ?? '0';
</script>

<section class="block">
	<div class="flex items-center gap-2">
		{#if rank !== -1}
			<a
				class="p-2 rounded-md max-w-fit z-10 bg-gray-200 dark:bg-zinc-700"
				href={`/leaderboard/weight/farming/+${profiles.ign}-${profiles.selected.id}`}
			>
				<span class="mx-1 text-2xl font-semibold font-mono text-yellow-700 dark:text-yellow-400">
					<span class="text-lg mr-0.5">#</span>{rank}
				</span>
			</a>
		{:else}
			<div class="p-2 rounded-md max-w-fit z-10 bg-gray-200 dark:bg-zinc-700">
				<span class="mx-1 text-lg font-semibold">
					{rankText}
				</span>
			</div>
		{/if}
		<Profiles {...profiles} />
	</div>

	<div class="object-scale-down">
		<h1 class="text-7xl md:text-8xl">{weightStr}</h1>
		<h1 class="text-sm md:text-base w-full text-right">Farming Weight</h1>
	</div>
</section>
