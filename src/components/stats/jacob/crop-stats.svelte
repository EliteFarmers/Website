<script lang="ts">
	import type { components } from '$lib/api/api';
	import CropSelector from '../contests/crop-selector.svelte';
	import { DEFAULT_SELECTED_CROPS, getSelectedCrops } from '$lib/stores/selectedCrops';
	import CropMedalCounts from './crop-medal-counts.svelte';
	import { CROP_TO_ELITE_CROP } from '$lib/constants/crops';
	import { Crop, getCropFromName } from 'farming-weight';
	import { onMount } from 'svelte';
	import ContestList from './contest-list.svelte';

	interface Props {
		jacob: components['schemas']['JacobDataDto'] | undefined;
		crop?: string;
	}

	let { jacob, crop: initalCrop = 'Wheat' }: Props = $props();

	const contestsByCrop = $derived(
		jacob?.contests?.reduce<Record<string, components['schemas']['ContestParticipationDto'][]>>((acc, contest) => {
			if (!contest.crop) return acc;

			acc[contest.crop] ??= [];
			acc[contest.crop].push(contest);
			return acc;
		}, {}) ?? {}
	);

	const selectedCrops = getSelectedCrops();
	const crop = $derived(Object.entries($selectedCrops).find(([_, value]) => value)?.[0] ?? initalCrop);
	const cropKey = $derived(CROP_TO_ELITE_CROP[getCropFromName(crop) ?? Crop.Wheat]);
	const cropStats = $derived(jacob?.stats?.crops?.[cropKey as keyof typeof jacob.stats.crops] ?? {});

	const contests = $derived(contestsByCrop[crop] ?? []);

	const recentContests = $derived(
		contests?.sort((a, b) => (b?.timestamp ?? 0) - (a?.timestamp ?? 0)).slice(0, 30) ?? []
	);

	onMount(() => {
		if (initalCrop) {
			selectedCrops.set({ ...DEFAULT_SELECTED_CROPS, [initalCrop]: true });
		}
	});
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-4">
	<CropSelector radio={true} />

	<div class="flex flex-col items-center justify-center gap-4">
		<div class="flex flex-col items-center gap-2">
			<CropMedalCounts stats={cropStats} />
			<div class="flex flex-wrap gap-2">
				<div class="flex flex-col items-center rounded-md bg-primary-foreground p-2">
					<span
						><span class="text-lg font-semibold">{cropStats.participations?.toLocaleString()}</span> Participations</span
					>
				</div>
				<div class="flex flex-col items-center rounded-md bg-primary-foreground p-2">
					<span
						><span class="text-lg font-semibold">{cropStats.firstPlaceScores?.toLocaleString()}</span> First
						Place Scores</span
					>
				</div>
			</div>
		</div>
		<ContestList contests={recentContests} remining={contests.length - recentContests.length} />
	</div>
</div>
