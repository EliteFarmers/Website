<script lang="ts">
	import Head from '$comp/head.svelte';
	import Contest from '$comp/stats/jacob/contest.svelte';
	import MedalCounts from '$comp/stats/jacob/medalcounts.svelte';
	import { getTimeStamp } from '$lib/format';
	import type { PageData } from './$types';
	import * as Accordion from '$ui/accordion';
	import { Switch } from '$ui/switch';
	import { Button } from '$ui/button';

	let timeType = $state(false);
	let accordionValues = $state<string[]>([]);

	function expandAll() {
		accordionValues = Object.keys(data.years ?? {}).map((year) => `year-${year}`);
	}

	function collapseAll() {
		accordionValues = [];
	}

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<Head
	title="{data.account?.name ?? 'Unknown'} | Jacob's Contests"
	description="View all {data.contestsCount} Jacob's Contests participated in by {data.account?.name ?? 'Unknown'}!"
/>

<section class="flex w-full flex-col items-center justify-center">
	<div class="mx-4 flex flex-col items-center justify-center sm:w-full md:w-[90%] lg:w-[80%]">
		<div class="my-8 flex flex-col items-center">
			<MedalCounts
				participations={data.contestsCount}
				medals={{
					diamond: data.member?.jacob?.earnedMedals?.diamond ?? 0,
					platinum: data.member?.jacob?.earnedMedals?.platinum ?? 0,
					gold: data.member?.jacob?.earnedMedals?.gold ?? 0,
					silver: data.member?.jacob?.earnedMedals?.silver ?? 0,
					bronze: data.member?.jacob?.earnedMedals?.bronze ?? 0,
				}}
			/>

			<div class="my-2 mt-4 flex flex-row items-center gap-2">
				<Switch bind:checked={timeType} />
				<span>Show Real Life Time</span>
			</div>
		</div>

		<div class="mb-4 flex gap-4">
			<Button onclick={expandAll}>Expand All</Button>
			<Button onclick={collapseAll}>Collapse All</Button>
		</div>

		<Accordion.Root type="multiple" class="mx-4 w-full max-w-6xl items-center" value={accordionValues}>
			{#each Object.entries(data.years ?? {}).sort((a, b) => +b[0] - +a[0]) as [year, conts] (year)}
				<Accordion.Item value="year-{year}">
					<Accordion.Trigger class="flex justify-center hover:no-underline">
						<div class="mr-4 flex flex-col items-center justify-center gap-2">
							<div class="flex w-full flex-row items-center justify-between">
								<p class="flex-1 text-start text-xl font-semibold">Year {year}</p>
								<span class="text-normal font-mono">
									{new Date(getTimeStamp(+year - 1, 0, 0) * 1000).toLocaleDateString() +
										' - ' +
										new Date(getTimeStamp(+year, 0, 0) * 1000).toLocaleDateString()}
								</span>
							</div>

							<MedalCounts
								participations={conts?.length}
								medals={{
									diamond: conts?.filter((c) => c.medal === 'diamond').length ?? 0,
									platinum: conts?.filter((c) => c.medal === 'platinum').length ?? 0,
									gold: conts?.filter((c) => c.medal === 'gold').length ?? 0,
									silver: conts?.filter((c) => c.medal === 'silver').length ?? 0,
									bronze: conts?.filter((c) => c.medal === 'bronze').length ?? 0,
								}}
							/>
						</div>
					</Accordion.Trigger>

					<Accordion.Content>
						<div class="flex flex-wrap justify-center gap-4">
							{#each conts ?? [] as contest}
								<div class="basis-64">
									<Contest {contest} irlTime={timeType} />
								</div>
							{/each}
						</div>
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>

		{#if data.contestsCount === 0}
			<div class="flex w-full flex-col items-center justify-center">
				<p class="text-2xl font-bold">No Contests</p>
				<p class="text-lg">This player has not participated in any contests.</p>
			</div>
		{/if}
	</div>
</section>
