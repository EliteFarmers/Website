<script lang="ts">
	import type { components } from '$lib/api/api';
	import type { ProfileDetails } from '$lib/api/elite';
	import Profiles from './profiles.svelte';

	interface Props {
		weightInfo: components['schemas']['FarmingWeightDto'] | undefined;
		rank: number;
		profiles: {
			ign: string;
			selected: ProfileDetails;
			profiles: ProfileDetails[];
		};
	}

	let { weightInfo, rank, profiles }: Props = $props();

	let rankText = $derived(rank !== -1 ? `#${rank}` : 'Unranked');

	let weightStr = $derived(weightInfo?.totalWeight?.toLocaleString() ?? '0');
</script>

<div class="block">
	<div class="z-10 flex items-center gap-2">
		{#if rank !== -1}
			<a
				class="max-w-fit rounded-md bg-primary-foreground p-1 hover:bg-muted lg:p-1"
				href={`/leaderboard/farmingweight/${profiles.ign}-${profiles.selected.id}`}
			>
				<span class="mx-1 font-mono text-2xl font-semibold text-yellow-700 dark:text-yellow-400">
					<span class="mr-0.5 text-lg">#</span>{rank}
				</span>
			</a>
		{:else}
			<div class="max-w-fit rounded-md bg-primary-foreground p-1 lg:p-2">
				<span class="text-md mx-1 font-semibold md:text-lg">
					{rankText}
				</span>
			</div>
		{/if}
		<Profiles {...profiles} />
	</div>

	<div class="object-scale-down">
		<h1 class="text-5xl md:text-6xl lg:text-8xl">{weightStr}</h1>
		<h1 class="w-full text-right text-sm md:text-lg">Farming Weight</h1>
	</div>
</div>
