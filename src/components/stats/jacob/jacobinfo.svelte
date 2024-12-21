<script lang="ts">
	import * as Card from '$ui/card';
	import type { components } from '$lib/api/api';
	import CropSelector from '../contests/crop-selector.svelte';
	import Cropstats from './cropstats.svelte';
	import Medals from './medals.svelte';
	import Recents from './recents.svelte';
	import Stats from './stats.svelte';
	import { getSelectedCrops } from '$lib/stores/selectedCrops';
	import RecentContests from './recent-contests.svelte';
	import CropMedalCounts from './crop-medal-counts.svelte';
	import { API_CROP_TO_CROP, CROP_TO_ELITE_CROP } from '$lib/constants/crops';
	import { Crop, getCropFromName } from 'farming-weight';

	interface Props {
		jacob: components['schemas']['JacobDataDto'] | undefined;
		crop?: string;
		ign: string;
		ranks?: {
			bronze: number;
			silver: number;
			gold: number;
			platinum: number;
			diamond: number;
			participations: number;
			firstPlaces: number;
		};
	}

	let {
		jacob,
		ign,
		ranks = {
			bronze: -1,
			silver: -1,
			gold: -1,
			platinum: -1,
			diamond: -1,
			participations: -1,
			firstPlaces: -1,
		},
		crop: initalCrop = 'Wheat',
	}: Props = $props();

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
</script>

<section class="mx-2 mb-8 flex-col justify-center gap-4 py-4 align-middle" aria-labelledby="Jacob">
	<h1 id="Jacob" class="pt-2 text-center text-3xl">{ign} &nbsp;-&nbsp; Jacob Stats</h1>

	<CropSelector radio={true} />

	<Card.Root class="mx-auto max-w-7xl">
		<Card.Content class="flex flex-col items-center justify-center gap-4">
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
			<div class="flex flex-col items-center gap-4 md:flex-row">
				<RecentContests {contests} />
			</div>
		</Card.Content>
	</Card.Root>
	<!-- <div class="my-8 flex flex-row items-center justify-center">
		<Cropstats {jacob} />
	<!-- </div> -->

	<div class="my-8 flex flex-row items-center justify-center">
		<Cropstats {jacob} />
	</div>

	<div class="flex flex-col items-center justify-center gap-4 md:gap-8 lg:flex-row lg:items-start">
		<div class="flex-1 lg:max-w-2xl">
			<Medals total={jacob?.medals} earned={jacob?.earnedMedals} {ranks} />

			<Stats {jacob} participationsRank={ranks.participations} firstPlacesRank={ranks.firstPlaces} />
		</div>
		<div class="flex-1 lg:max-w-2xl">
			<Recents contests={jacob?.contests} />
		</div>
	</div>
</section>
