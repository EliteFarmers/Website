<script lang="ts">
	import { browser } from '$app/environment';
	import Apex from '$comp/charts/apex.svelte';
	import { Button } from '$comp/ui/button';
	import { SliderSimple } from '$comp/ui/slider';
	import type { ContestParticipationDto } from '$lib/api';
	import * as Accordion from '$ui/accordion';
	import * as Select from '$ui/select';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	let selectedSplit = $state<number | undefined>(500);
	let minLength: number = $state(10);
	let maxGap: number = $state(5);

	function intoSeries(crops: typeof data.contests) {
		const record = crops?.reduce<Record<string, number[]>>((acc, curr) => {
			if (!curr.crop || !curr.timestamp) return acc;

			if (!acc[curr.crop]) {
				acc[curr.crop] = new Array(24).fill(0);
			}

			acc[curr.crop ?? ''][curr.hour]++;

			return acc;
		}, {});

		if (!record) return [];

		return Object.entries(record).map(([name, data]) => {
			const first = crops?.at(0) ?? { timestamp: 0 };
			const last = crops?.at(-1) ?? { timestamp: 0 };
			return { name, data, start: Number(first?.timestamp ?? 0), end: Number(last?.timestamp ?? 0) };
		});
	}

	function splitIntoGroups<T>(arr: T[], size: number): T[][] {
		const groups = [];
		for (let i = 0; i < arr.length; i += size) {
			groups.push(arr.slice(i, i + size));
		}

		return groups;
	}

	const splitOptions = [
		{ label: 'None', value: 0 },
		{ label: '100', value: 100 },
		{ label: '200', value: 200 },
		{ label: '300', value: 300 },
		{ label: '400', value: 400 },
		{ label: '500', value: 500 },
		{ label: '750', value: 750 },
		{ label: '1000', value: 1000 },
	];

	let splitBy = $derived(selectedSplit ?? 500);
	let minLengthNum = $derived(isNaN(+minLength) ? 10 : +minLength);
	let maxGapNum = $derived(isNaN(+maxGap) ? 5 : +maxGap);
	let contests = $derived(data.contests ?? []);
	let longStreaks = $state<Record<string, ContestParticipationDto[]>>({});

	onMount(() => {
		calculateStreaks();
	});

	function calculateStreaks() {
		longStreaks = {};
		let currentStreak = [] as ContestParticipationDto[];

		for (const contest of contests) {
			if (!contest.crop || !contest.timestamp) continue;

			const date = contest.timestamp;

			if (currentStreak.length === 0) {
				currentStreak.push(contest);
			} else {
				const last = currentStreak.at(-1) ?? {
					timestamp: 0,
				};
				const lastDate = last.timestamp ?? 0;

				// Check if the contests were less than X hours apart
				const diff = Number(date) - Number(lastDate);
				if (diff !== 0 && diff < maxGapNum * 60 * 60) {
					currentStreak.push(contest);
				} else if (diff !== 0) {
					if (currentStreak.length > minLengthNum) {
						currentStreak.push(contest);
						longStreaks[Number(contest.timestamp ?? 0)] = currentStreak.slice();
					}

					currentStreak = [contest];
				}
			}

			longStreaks = { ...longStreaks };
		}
	}

	let splitCrops = $derived.by<{ name: string; data: number[]; start?: number; end?: number }[][]>(() => {
		if (splitBy === 0 || isNaN(+splitBy) || +splitBy < 100 || !browser) {
			return [];
		}

		return splitIntoGroups(contests, +splitBy).map(intoSeries);
	});

	let options = $derived({
		series: intoSeries(contests),
		chart: {
			type: 'bar',
			height: 350,
			stacked: true,
			toolbar: {
				show: true,
			},
			zoom: {
				enabled: true,
			},
		},
		responsive: [
			{
				breakpoint: 480,
				options: {
					legend: {
						position: 'bottom',
						offsetX: -10,
						offsetY: 0,
					},
				},
			},
		],
		plotOptions: {
			bar: {
				horizontal: false,
				borderRadius: 5,
				dataLabels: {
					total: {
						enabled: true,
						style: {
							fontSize: '13px',
							fontWeight: 900,
						},
					},
				},
			},
		},
		xaxis: {
			type: 'category',
			categories: [
				'00',
				'01',
				'02',
				'03',
				'04',
				'05',
				'06',
				'07',
				'08',
				'09',
				'10',
				'11',
				'12',
				'13',
				'14',
				'15',
				'16',
				'17',
				'18',
				'19',
				'20',
				'21',
				'22',
				'23',
			],
		},
		legend: {
			position: 'right',
			offsetY: 40,
		},
		fill: {
			opacity: 1,
		},
	});
</script>

{@render children?.()}

{#if data.moderator}
	<div class="my-16 flex flex-col items-center justify-center gap-2">
		<p class="text-lg">Contests By Hour</p>
		<p>{contests.length.toLocaleString()} Contests</p>
		<Apex {options} animate={false} />
		{#key splitBy}
			{#if splitCrops.length > 0}
				<div class="flex flex-row items-center gap-2">
					<p class="text-lg whitespace-nowrap">Split by</p>
					<Select.Simple
						bind:value={selectedSplit}
						options={splitOptions}
						placeholder="500"
						class="min-w-40"
					/>
				</div>
				{#each splitCrops as graph (graph)}
					<p class="text-lg">
						{new Date(+(graph[0].start ?? 0) * 1000).toDateString()} -
						{new Date(+(graph[0].end ?? 0) * 1000).toDateString()}
					</p>
					<Apex options={{ ...options, series: graph }} animate={false} />
				{/each}
			{/if}
		{/key}

		<div class="flex flex-row items-center gap-2 whitespace-nowrap">
			<p>Min Streak Length</p>
			<SliderSimple class="h-12 min-w-32" min={3} max={15} bind:value={minLength} step={1} />
			<p>{minLength}</p>
		</div>
		<div class="flex flex-row items-center gap-2 whitespace-nowrap">
			<p>Max Hour Gap</p>
			<SliderSimple class="h-12 min-w-32" min={1} max={15} bind:value={maxGap} step={1} />
			<p>{maxGap}</p>
		</div>
		<Button onclick={calculateStreaks}>Update</Button>

		<Accordion.Root type="multiple">
			{#each Object.values(longStreaks).sort((a, b) => b.length - a.length) as streak, i (streak)}
				{@const first = streak.at(0) ?? { timestamp: 0 }}
				{@const last = streak.at(-2) ?? { timestamp: 0 }}
				{@const firstDate = new Date(Number(first.timestamp ?? 0) * 1000)}
				{@const lastDate = new Date(Number(last.timestamp ?? 0) * 1000)}
				{@const diff = lastDate.getTime() - firstDate.getTime()}

				<Accordion.Item value="item-{i}">
					<Accordion.Trigger>
						<div>
							<p class="text-lg">{firstDate.toUTCString()} - {lastDate.toUTCString()}</p>
							<p class="text-lg">{streak.length - 1} / {diff / 1000 / 60 / 60} hours</p>
						</div>
					</Accordion.Trigger>
					<Accordion.Content>
						{#each streak as contest, i (contest)}
							{@const currDate = new Date(Number(contest.timestamp ?? 0) * 1000)}
							{@const prev = i > 0 ? streak.at(i - 1) : undefined}
							{@const h = currDate.getUTCHours()}

							<p class="text-lg last:text-gray-600">
								{#if prev}
									{@const hours =
										(currDate.getTime() - Number(prev?.timestamp ?? 0) * 1000) / 1000 / 60 / 60}
									<span class="font-mono text-xl text-green-700">{hours}</span>
								{:else}
									<span class="font-mono text-xl">+</span>
								{/if}
								<span>{currDate.toLocaleDateString()} {h < 10 ? `0${h}` : h}:15</span>
								<span class="text-lg">{contest.crop}</span>
							</p>
						{/each}
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	</div>
{/if}
