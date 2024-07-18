<script lang="ts">
	import type { components } from '$lib/api/api';
	import type { ProfileDetails } from '$lib/api/elite';
	import Profiles from './profiles.svelte';

	export let weightInfo: components['schemas']['FarmingWeightDto'] | undefined;
	export let rank: number;

	export let profiles: {
		ign: string;
		selected: ProfileDetails;
		profiles: ProfileDetails[];
	};

	$: rankText = rank !== -1 ? `#${rank}` : 'Unranked';

	$: weightStr = weightInfo?.totalWeight?.toLocaleString() ?? '0';
</script>

<div class="flex items-center gap-2 z-10 min-h-fit">
	{#if rank !== -1}
		<a
			class="p-1 lg:p-2 rounded-md max-w-fit bg-primary-foreground hover:bg-muted"
			href={`/leaderboard/farmingweight/${profiles.ign}-${profiles.selected.id}`}
		>
			<span class="mx-1 text-2xl font-semibold font-mono text-yellow-700 dark:text-yellow-400">
				<span class="text-lg mr-0.5">#</span>{rank}
			</span>
		</a>
	{:else}
		<div class="p-1 lg:p-2 rounded-md bg-primary-foreground">
			<div class="scale-75">
				<span class="text-2xl md:text-3xl font-semibold">
					{rankText}
				</span>
			</div>
		</div>
	{/if}
	<Profiles {...profiles} />
</div>

<div class="object-scale-down *:text-right">
	<h4 class="text-5xl md:text-6xl lg:text-8xl">{weightStr}</h4>
	<h4 class="text-sm md:text-lg">Farming Weight</h4>
</div>
