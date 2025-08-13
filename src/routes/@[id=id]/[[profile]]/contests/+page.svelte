<script lang="ts">
	import Head from '$comp/head.svelte';
	import Contest from '$comp/stats/jacob/contest.svelte';
	import MedalCounts from '$comp/stats/jacob/medalcounts.svelte';
	import type { ContestParticipationDto } from '$lib/api';
	import { getSkyblockDate, getTimeStamp } from '$lib/format';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import { Switch } from '$ui/switch';

	let timeType = $state(false);
	let accordionValues = $state<string[]>([]);

	function expandAll() {
		accordionValues = Object.keys(years ?? {}).map((year) => `year-${year}`);
	}

	function collapseAll() {
		accordionValues = [];
	}

	const ctx = getStatsContext();
	const member = ctx.member;

	const contestsCount = $derived(member.jacob?.contests?.length ?? 0);
	const years = $derived(processContests());

	function processContests() {
		const years = {} as Partial<Record<number, ContestParticipationDto[]>>;

		for (const contest of member.jacob?.contests ?? []) {
			const year = getSkyblockDate(contest.timestamp ?? 0n).year + 1;
			if (!years[year]) years[year] = [];

			years[year]?.push(contest);
		}

		// Sort each year by timestamp
		for (const year in years) {
			years[year] = years[year]?.sort((a, b) => Number((b.timestamp ?? 0) - (a.timestamp ?? 0)));
		}

		return years;
	}
</script>

<Head
	title="{ctx.ignMeta ?? 'Unknown'} | Jacob's Contests"
	description="View all {contestsCount} Jacob's Contests participated in by {ctx.ignMeta ?? 'Unknown'}!"
/>

<section class="flex w-full flex-col items-center justify-center">
	<div class="mx-4 flex flex-col items-center justify-center sm:w-full md:w-[90%] lg:w-[80%]">
		<div class="my-8 flex flex-col items-center">
			<MedalCounts
				participations={contestsCount}
				medals={{
					diamond: member?.jacob?.earnedMedals?.diamond ?? 0,
					platinum: member?.jacob?.earnedMedals?.platinum ?? 0,
					gold: member?.jacob?.earnedMedals?.gold ?? 0,
					silver: member?.jacob?.earnedMedals?.silver ?? 0,
					bronze: member?.jacob?.earnedMedals?.bronze ?? 0,
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
			{#each Object.entries(years ?? {}).sort((a, b) => +b[0] - +a[0]) as [year, conts] (year)}
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
							{#each conts ?? [] as contest, i (i)}
								<div class="basis-64">
									<Contest {contest} irlTime={timeType} />
								</div>
							{/each}
						</div>
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>

		{#if contestsCount === 0}
			<div class="flex w-full flex-col items-center justify-center">
				<p class="text-2xl font-bold">No Contests</p>
				<p class="text-lg">This player has not participated in any contests.</p>
			</div>
		{/if}
	</div>
</section>
