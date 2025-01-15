<script lang="ts">
	import type { components } from '$lib/api/api';
	import CropSelector from '$comp/stats/contests/crop-selector.svelte';
	import { DEFAULT_SELECTED_CROPS, getSelectedCrops } from '$lib/stores/selectedCrops';
	import CropMedalCounts from '$comp/stats/jacob/crop-medal-counts.svelte';
	import { CROP_TO_ELITE_CROP } from '$lib/constants/crops';
	import { Crop, getCropFromName } from 'farming-weight';
	import { onMount } from 'svelte';
	import ContestList from '$comp/stats/jacob/contest-list.svelte';

	type CropStats = components['schemas']['JacobDataDto']['stats'];

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
	const crops = $derived(
		Object.entries($selectedCrops)
			.filter(([, value]) => value)
			.map(([key]) => key)
	);

	const contests = $derived(
		crops.length === 0 ? Object.values(contestsByCrop).flat() : crops.flatMap((c) => contestsByCrop[c] ?? [])
	);

	const recentContests = $derived(
		contests?.sort((a, b) => (b?.timestamp ?? 0) - (a?.timestamp ?? 0)).slice(0, 30) ?? []
	);

	const MEDAL_TYPES = ['diamond', 'platinum', 'gold', 'silver', 'bronze'] as const;

	const allCropStats = $derived((crop: string) => {
		const cropKey = CROP_TO_ELITE_CROP[getCropFromName(crop) ?? Crop.Wheat] as keyof CropStats;
		return (
			jacob?.stats?.crops?.[cropKey] ??
			({
				participations: 0,
				firstPlaceScores: 0,
				medals: {},
			} as components['schemas']['JacobCropStatsDto'])
		);
	});

	type ReducedCropStats = {
		participations: 0;
		firstPlaceScores: 0;
		medals: Record<(typeof MEDAL_TYPES)[number], number>;
	};

	const combineCropStats = $derived((crops: components['schemas']['JacobCropStatsDto'][]) => {
		return crops.reduce<ReducedCropStats>(
			(acc, crop) => {
				acc.participations += crop.participations ?? 0;
				acc.firstPlaceScores += crop.firstPlaceScores ?? 0;

				MEDAL_TYPES.forEach((type) => {
					acc.medals[type] ??= 0;
					acc.medals[type] += (crop.medals as Record<typeof type, number>)?.[type] ?? 0;
				});

				return acc;
			},
			{
				participations: 0,
				firstPlaceScores: 0,
				medals: { diamond: 0, platinum: 0, gold: 0, silver: 0, bronze: 0 },
			}
		);
	});

	const selectedCropsStats = $derived(
		crops.length === 0
			? combineCropStats(Object.values(jacob?.stats?.crops ?? {}))
			: combineCropStats(crops.map((c) => allCropStats(c)))
	);

	onMount(() => {
		if (initalCrop) {
			selectedCrops.set({ ...DEFAULT_SELECTED_CROPS, [initalCrop]: true });
		}
	});
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-4">
	<CropSelector />

	<div class="flex flex-col items-center justify-center gap-4">
		<div class="flex flex-col items-center gap-2">
			<CropMedalCounts stats={selectedCropsStats} />
			<div class="flex flex-wrap gap-2">
				<div class="flex flex-col items-center rounded-md bg-primary-foreground p-2">
					<span
						><span class="text-lg font-semibold">{selectedCropsStats.participations?.toLocaleString()}</span
						> Participations</span
					>
				</div>
				<div class="flex flex-col items-center rounded-md bg-primary-foreground p-2">
					<span
						><span class="text-lg font-semibold"
							>{selectedCropsStats.firstPlaceScores?.toLocaleString()}</span
						> First Place Scores</span
					>
				</div>
			</div>
		</div>
		<ContestList contests={recentContests} remaining={contests.length - recentContests.length} />
	</div>
</div>
