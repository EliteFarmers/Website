<script lang="ts">
	import CropGraph from '$comp/charts/crop-graph.svelte';
	import SkillGraph from '$comp/charts/skill-graph.svelte';
	import Head from '$comp/head.svelte';
	import JumpLink from '$comp/jump-link.svelte';
	import Cropselector from '$comp/stats/contests/crop-selector.svelte';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getCollectionCharts, getSkillCharts } from '$lib/remote/graphs.remote';
	import { getAnyCropSelected, getSelectedCrops } from '$lib/stores/selectedCrops';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Button } from '$ui/button';
	import { DatePicker } from '$ui/date-picker';
	import { SelectSimple } from '$ui/select';
	import { Skeleton } from '$ui/skeleton';
	import { Switch } from '$ui/switch';
	import * as Tooltip from '$ui/tooltip';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { differenceInDays } from 'date-fns';
	import { Crop, CROP_WEIGHT, getCropDisplayName, getCropFromName, Skill } from 'farming-weight';
	import { onMount, tick } from 'svelte';

	const ctx = getStatsContext();

	const anySelected = getAnyCropSelected();
	const selectedCrops = getSelectedCrops();
	const minDate = new CalendarDate(2023, 7, 1);

	type CropPoint = { date: string; value: number; pests: number };
	type SkillPoint = { date: string; value: number };
	type WeightPoint = { date: string; value: number };
	type CropGraphs = Record<string, CropPoint[]>;
	type SkillGraphs = Record<string, SkillPoint[]>;

	let view = $state<'crops' | 'skills'>('crops');
	let cropGraphs = $state({} as CropGraphs);
	let skillGraphs = $state({} as SkillGraphs);
	let weightPoints = $state([] as WeightPoint[]);

	let collectionsKey = $state<string | null>(null);
	let skillsKey = $state<string | null>(null);
	let pendingScrollTo = $state<string | null>(null);
	let initialWantsSkills = $state(false);

	let collectionsPromise = $state<Promise<unknown> | null>(null);
	let skillsPromise = $state<Promise<unknown> | null>(null);
	let collectionsError = $state<unknown>(null);
	let skillsError = $state<unknown>(null);

	const skeletonCards = Array.from({ length: 6 }, (_, i) => i);

	function mapCrops() {
		const nextIncreases = {} as Record<string, number>;
		let nextHighestIncrease = 0;
		let nextPestIncreased = false;

		const nextEntries = Object.entries(cropGraphs)
			.filter(([crop]) => crop !== 'seeds')
			.map(([crop, data]) => {
				const c = getCropFromName(crop) ?? Crop.Wheat;
				const name = getCropDisplayName(c);

				if (data.length < 2) {
					nextIncreases[crop] = 0;
				} else {
					const first = data[0];
					const last = data.at(-1) ?? first;
					nextIncreases[crop] = (last.value - first.value) * CROP_WEIGHT[c];
					nextHighestIncrease = Math.max(nextHighestIncrease, nextIncreases[crop]);
					nextPestIncreased = nextPestIncreased || last.pests > 0;
				}

				return { name, data, crop };
			});

		cropIncreases = nextIncreases;
		highestCropIncrease = Math.max(1, nextHighestIncrease);
		pestIncreased = nextPestIncreased;
		return nextEntries;
	}

	function mapSkills() {
		const nextIncreases = {} as Record<string, number>;
		let nextHighestIncrease = 0;

		const nextEntries = Object.entries(skillGraphs)
			.filter(([, points]) => points.length > 0)
			.map(([skill, points]) => {
				if (points.length < 2) {
					nextIncreases[skill] = 0;
				} else {
					const first = points[0];
					const last = points.at(-1) ?? first;
					nextIncreases[skill] = last.value - first.value;
					nextHighestIncrease = Math.max(nextHighestIncrease, nextIncreases[skill]);
				}
				return { skill, data: points };
			})
			.sort((a, b) => a.skill.localeCompare(b.skill));

		skillIncreases = nextIncreases;
		highestSkillIncrease = Math.max(1, nextHighestIncrease);
		return nextEntries;
	}

	function getStart(daysToSubtract: number) {
		const dayDiff = differenceInDays(today(tz).toDate(tz), value.toDate(tz));
		if (!value || dayDiff > 30) return;

		value = initEnd.subtract({ days: daysToSubtract });
	}

	function back() {
		value = value.subtract({ days: days });
	}

	function forward() {
		if (value >= initEnd) return;
		value = value.add({ days: days });
		if (value > initEnd) value = initEnd;
	}

	let cropIncreases = $state({} as Record<string, number>);
	let highestCropIncrease = $state(1);
	let pestIncreased = $state(false);
	let cropEntries = $state<ReturnType<typeof mapCrops>>([]);

	let skillIncreases = $state({} as Record<string, number>);
	let highestSkillIncrease = $state(1);
	let skillEntries = $state<ReturnType<typeof mapSkills>>([]);

	const hasData = $derived(
		view === 'crops' ? cropEntries.length > 0 || weightPoints.length > 0 : skillEntries.length > 0
	);
	const isLoading = $derived(view === 'crops' ? collectionsPromise !== null : skillsPromise !== null);
	const showNoData = $derived(
		!isLoading && !hasData && (view === 'crops' ? collectionsKey !== null : skillsKey !== null)
	);

	function makeKey(start: number, days: number) {
		return `${start}:${days}`;
	}

	async function loadCollections(force = false) {
		const uuid = ctx.uuid;
		const profileId = ctx.member.current?.profileId;
		if (!uuid || !profileId) return;

		const key = makeKey(startTime, days);
		if (!force && collectionsKey === key) return;

		disabled = true;
		try {
			const res = await getCollectionCharts({ playerUuid: uuid, profileUuid: profileId, start: startTime, days });
			cropGraphs = (res?.cropGraph ?? {}) as CropGraphs;
			weightPoints = (res?.weight ?? []) as WeightPoint[];
			cropEntries = mapCrops();
			collectionsKey = key;
		} finally {
			disabled = false;
		}
	}

	function runCollectionsLoad(force = false) {
		collectionsError = null;
		const p = loadCollections(force);
		collectionsPromise = p;
		p.catch((e) => {
			collectionsError = e;
		}).finally(() => {
			if (collectionsPromise === p) collectionsPromise = null;
		});
	}

	async function loadSkills(force = false) {
		const uuid = ctx.uuid;
		const profileId = ctx.member.current?.profileId;
		if (!uuid || !profileId) return;

		const key = makeKey(startTime, days);
		if (!force && skillsKey === key) return;

		disabled = true;
		try {
			const res = await getSkillCharts({ playerUuid: uuid, profileUuid: profileId, start: startTime, days });
			skillGraphs = (res?.skillGraph ?? {}) as SkillGraphs;
			skillEntries = mapSkills();
			skillsKey = key;

			if (pendingScrollTo) {
				await tick();
				globalThis.document?.getElementById(pendingScrollTo)?.scrollIntoView({ block: 'start' });
				pendingScrollTo = null;
			}
		} finally {
			disabled = false;
		}
	}

	function runSkillsLoad(force = false) {
		skillsError = null;
		const p = loadSkills(force);
		skillsPromise = p;
		p.catch((e) => {
			skillsError = e;
		}).finally(() => {
			if (skillsPromise === p) skillsPromise = null;
		});
	}

	onMount(() => {
		const hash = decodeURIComponent(globalThis.location?.hash?.slice(1) ?? '');
		const skillByLower = new Map(Object.values(Skill).map((s) => [s.toLowerCase(), s] as const));
		const matchedSkill = hash ? skillByLower.get(hash.toLowerCase()) : undefined;
		if (matchedSkill) {
			view = 'skills';
			pendingScrollTo = matchedSkill;
			initialWantsSkills = true;
		}
	});

	$effect(() => {
		if (collectionsKey !== null) return;
		const uuid = ctx.uuid;
		const profileId = ctx.member.current?.profileId;
		if (!uuid || !profileId) return;
		runCollectionsLoad(true);
	});

	$effect(() => {
		if (!initialWantsSkills) return;
		if (skillsKey !== null) return;
		const uuid = ctx.uuid;
		const profileId = ctx.member.current?.profileId;
		if (!uuid || !profileId) return;
		runSkillsLoad(true);
	});

	let pestToggle = $state(false);

	let showPests = $derived(pestToggle && pestIncreased);
	let selected = $derived((crop: string) => $selectedCrops[crop] || !$anySelected);
	let selectedCount = $derived(Object.values($selectedCrops).filter(Boolean).length);
	let fewSelected = $derived(selectedCount <= 3 && $anySelected);
	const tz = getLocalTimeZone();

	let daysString = $state('7');
	let days = $derived(+(daysString ?? '7'));

	const initEnd = today(tz);
	let disabled = $state(false);
	let initStart = initEnd.subtract({ days: 7 });

	let value = $state(initStart);

	let backEnabled = $derived(value <= minDate);
	let fowardEnabled = $derived(value >= initEnd);
	let startTime = $derived(Math.floor(value.toDate(tz).getTime() / 1000));
</script>

<Head
	title="{ctx.ignMeta} | Charts"
	description="See crop collection charts for Hypixel Skyblock!"
	canonicalPath="/@{ctx.ign}/{encodeURIComponent(ctx.selectedProfile?.profileName ?? '')}/charts"
/>

<div class="flex w-full flex-col items-center justify-center gap-4">
	<div class="flex flex-row justify-center">
		<div class="mb-4 flex max-w-fit flex-wrap justify-center rounded-md border border-solid p-1 sm:flex-row">
			<Button
				variant="ghost"
				size="sm"
				onclick={async () => {
					view = 'crops';
				}}
				class="{view === 'crops' ? 'bg-muted' : ''} w-1/2 cursor-pointer sm:w-auto"
			>
				Collections
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onclick={async () => {
					view = 'skills';
					runSkillsLoad();
				}}
				class="{view === 'skills' ? 'bg-muted' : ''} w-1/2 cursor-pointer sm:w-auto"
			>
				Skills
			</Button>
		</div>
	</div>

	{#if view === 'crops'}
		<Cropselector />
	{/if}
	<div class="flex flex-col items-center gap-2">
		<div class="flex flex-col items-center gap-2">
			<div class="flex flex-row items-center gap-2">
				<Button onclick={back} variant="outline" disabled={backEnabled}>
					<ArrowLeft />
				</Button>
				<DatePicker bind:value maxValue={initEnd} minValue={minDate} class="w-48" />
				<Button onclick={forward} variant="outline" disabled={fowardEnabled}>
					<ArrowRight />
				</Button>
			</div>
			<div class="flex flex-row items-center gap-2">
				{#if view === 'crops'}
					<div class="flex flex-col items-center gap-1 text-center">
						<p class="text-sm leading-none">Show Pests</p>
						{#if !pestIncreased}
							<Tooltip.Simple side="bottom">
								{#snippet child({ props })}
									<Switch {...props} bind:checked={pestToggle} disabled={true} />
								{/snippet}
								<div class="p-2">
									<p class="text-sm">Pest data not available for this time period.</p>
								</div>
							</Tooltip.Simple>
						{:else}
							<Switch bind:checked={pestToggle} />
						{/if}
					</div>
				{/if}
				<SelectSimple
					options={[
						{ label: '3 Days', value: '3' },
						{ label: '1 Week', value: '7' },
						{ label: '2 Weeks', value: '14' },
						{ label: '3 Weeks', value: '21' },
						{ label: '1 Month', value: '30' },
					]}
					value={daysString}
					change={(v) => {
						daysString = v ?? daysString;
						getStart(+(v ?? daysString));
					}}
					class="w-32"
				/>
				<Button
					type="button"
					variant="default"
					{disabled}
					onclick={async () => {
						if (view === 'crops') {
							runCollectionsLoad(true);
						} else {
							runSkillsLoad(true);
						}
					}}
				>
					Update
				</Button>
			</div>
		</div>
	</div>

	{#if showNoData}
		<div class="mb-16 flex max-w-lg flex-col items-center justify-center space-y-2 p-4 text-center">
			<h2 class="text-center text-3xl font-semibold">No Data Found</h2>
			<h4>Try a different time!</h4>
			<p>
				There may be nothing to find if a player has kept their collections API disabled or is new to the
				website.
			</p>
		</div>
	{/if}

	{#if view === 'crops'}
		{#if collectionsPromise}
			{#await collectionsPromise}
				<div class="w-full max-w-7xl flex-1 flex-col gap-1 p-2">
					<div class="ml-4 flex flex-row items-center gap-2">
						<Skeleton class="h-8 w-56" />
					</div>
					<Skeleton class="h-80 w-full rounded-md" />
				</div>
				<div class="flex w-full max-w-7xl flex-wrap justify-center">
					{#each skeletonCards as i (i)}
						<div class="flex basis-150 flex-col gap-1 p-2">
							<div class="ml-4 flex flex-row items-center gap-2">
								<Skeleton class="size-8 rounded-md" />
								<Skeleton class="h-8 w-40" />
							</div>
							<Skeleton class="h-80 w-full rounded-md" />
						</div>
					{/each}
				</div>
			{:catch}
				<div class="mb-16 flex max-w-lg flex-col items-center justify-center space-y-2 p-4 text-center">
					<h2 class="text-center text-3xl font-semibold">Failed to load graphs</h2>
					<p class="text-muted-foreground text-sm">{String(collectionsError ?? 'Unknown error')}</p>
				</div>
			{/await}
		{:else}
			{#if weightPoints.length > 0 && !$anySelected}
				<div class="w-full max-w-7xl flex-1 flex-col gap-1 p-2">
					<div class="ml-4 flex flex-row items-center gap-1">
						<h3 class="text-2xl">Farming Weight</h3>
						<JumpLink id="FarmingWeight" />
					</div>
					<SkillGraph data={weightPoints} skill="Farming Weight" ratio={1} metricLabel="Farming Weight" />
				</div>
			{/if}

			<div class="flex {fewSelected ? 'flex-col' : 'flex-wrap'} w-full max-w-7xl justify-center gap-y-4">
				{#each cropEntries as { name, crop, data } (crop)}
					{#if selected(name)}
						{#if !fewSelected}
							<div class="flex basis-150 flex-col gap-1 p-2">
								<div class="ml-4 flex flex-row gap-1">
									<img
										src={PROPER_CROP_TO_IMG[name]}
										alt={crop}
										class="pixelated aspect-square h-full w-8"
									/>
									<h3 class="text-2xl">{name}</h3>
									<JumpLink id={crop} />
								</div>
								<CropGraph
									{data}
									{crop}
									ratio={cropIncreases[crop] / highestCropIncrease}
									pests={showPests}
								/>
							</div>
						{:else}
							<div class="max-w-7xl flex-1 flex-col gap-1 p-2">
								<div class="ml-4 flex flex-row items-center gap-1">
									<img
										src={PROPER_CROP_TO_IMG[name]}
										alt={crop}
										class="pixelated aspect-square h-full w-8"
									/>
									<h3 class="text-2xl">{name}</h3>
									<JumpLink id={crop} />
								</div>
								<CropGraph {data} {crop} ratio={1} pests={showPests} />
							</div>
						{/if}
					{/if}
				{/each}
			</div>
		{/if}
	{:else if skillsPromise}
		{#await skillsPromise}
			<div class="flex w-full max-w-7xl flex-wrap justify-center">
				{#each skeletonCards as i (i)}
					<div class="flex basis-150 flex-col gap-1 p-2">
						<div class="ml-4 flex flex-row items-center gap-2">
							<Skeleton class="h-8 w-40" />
						</div>
						<Skeleton class="h-80 w-full rounded-md" />
					</div>
				{/each}
			</div>
		{:catch}
			<div class="mb-16 flex max-w-lg flex-col items-center justify-center space-y-2 p-4 text-center">
				<h2 class="text-center text-3xl font-semibold">Failed to load graphs</h2>
				<p class="text-muted-foreground text-sm">{String(skillsError ?? 'Unknown error')}</p>
			</div>
		{/await}
	{:else}
		<div class="flex w-full max-w-7xl flex-wrap justify-center gap-y-4">
			{#each skillEntries as { skill, data } (skill)}
				<div class="flex basis-150 flex-col gap-1 p-2">
					<div class="ml-4 flex flex-row gap-1">
						<h3 class="text-2xl first-letter:capitalize">{skill}</h3>
						<JumpLink id={skill} />
					</div>
					<SkillGraph {data} {skill} ratio={skillIncreases[skill] / highestSkillIncrease} />
				</div>
			{/each}
		</div>
	{/if}

	<div class="mx-4 mt-16 flex max-w-lg flex-col justify-center gap-1">
		<h5 class="text-center text-lg font-semibold">How is this data obtained?</h5>
		<p class="text-left">
			Your collections and skills are only stored when they're requested. This may result in missing data,
			especially if the player has had their API disabled. Data points are limited to 4 per 24 hours intentionally
			to minimize privacy concerns. This data originally comes from Hypixel's public API.
		</p>
	</div>
</div>
