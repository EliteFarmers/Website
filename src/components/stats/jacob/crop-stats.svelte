<script lang="ts">
	import CropSelector from '$comp/stats/contests/crop-selector.svelte';
	import ContestList from '$comp/stats/jacob/contest-list.svelte';
	import CropMedalCounts from '$comp/stats/jacob/crop-medal-counts.svelte';
	import type { components } from '$lib/api/api';
	import { CROP_TO_ELITE_CROP } from '$lib/constants/crops';
	import { getSelectedCrops } from '$lib/stores/selectedCrops';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Select from '$ui/select';
	import { calcWeightForCrop, Crop, getCropFromName } from 'farming-weight';

	const ctx = getStatsContext();
	const jacob = $derived(ctx.member.jacob);

	type CropStats = components['schemas']['JacobDataDto']['stats'];

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

	let sortBy = $state<string>('recent');

	const contests = $derived.by(() => {
		let filteredContests =
			crops.length === 0 ? Object.values(contestsByCrop).flat() : crops.flatMap((c) => contestsByCrop[c] ?? []);

		// Filter unclaimed contests when sorting by placement
		if (sortBy === 'placement') {
			filteredContests = filteredContests.filter((contest) => (contest.position ?? -1) > -1);
		}

		return filteredContests.sort((a, b) => {
			switch (sortBy) {
				case 'collection':
					return (b?.collected ?? 0) - (a?.collected ?? 0);
				case 'placement':
					return (a?.position ?? 0) - (b?.position ?? 0);
				case 'weight': {
					return (
						(b.crop ? calcWeightForCrop(getCropFromName(b.crop) ?? Crop.Wheat, b.collected ?? 0) : 0) -
						(a.crop ? calcWeightForCrop(getCropFromName(a.crop) ?? Crop.Wheat, a.collected ?? 0) : 0)
					);
				}
				case 'recent':
				default:
					return (b?.timestamp ?? 0) - (a?.timestamp ?? 0);
			}
		});
	});

	const recentContests = $derived(contests?.slice(0, 30) ?? []);

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
</script>

<div class="flex w-full max-w-6xl flex-col items-center justify-center gap-4">
	<CropSelector />

	<div class="flex flex-col items-center justify-center gap-4">
		<div class="flex flex-col items-center gap-2">
			<CropMedalCounts stats={selectedCropsStats} />
			<div class="flex flex-wrap justify-center gap-2 md:flex-row">
				<div class="bg-card flex flex-col items-center rounded-md p-2">
					<span
						><span class="text-lg font-semibold">{selectedCropsStats.participations?.toLocaleString()}</span
						> Participations</span
					>
				</div>
				<div class="bg-card flex flex-col items-center rounded-md p-2">
					<span
						><span class="text-lg font-semibold"
							>{selectedCropsStats.firstPlaceScores?.toLocaleString()}</span
						> First Place Scores</span
					>
				</div>
			</div>
		</div>
		<div class="w-full px-9">
			<p class="mb-1.5 text-sm leading-none">Sort By</p>
			<Select.Simple
				class="md:w-48"
				bind:value={sortBy}
				options={[
					{
						value: 'recent',
						label: 'Most Recent',
					},
					{
						value: 'collection',
						label: 'Highest Collection',
					},
					{
						value: 'placement',
						label: 'Best Placement',
					},
					{
						value: 'weight',
						label: 'Most Weight',
					},
				]}
			/>
		</div>
		<ContestList contests={recentContests} remaining={Math.max(0, contests.length - recentContests.length)} />
	</div>
</div>
