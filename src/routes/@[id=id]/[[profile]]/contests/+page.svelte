<script lang="ts">
	import Head from '$comp/head.svelte';
	import Contest from '$comp/stats/jacob/contest.svelte';
	import MedalCounts from '$comp/stats/jacob/medalcounts.svelte';
	import { getTimeStamp } from '$lib/format';
	import type { PageData } from './$types';
	import * as Accordion from '$ui/accordion';
	import { Switch } from '$ui/switch';

	let timeType = $state(false);

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<Head
	title="{data.account?.name ?? 'Unknown'} | Jacob's Contests"
	description="View all {data.contestsCount} Jacob's Contests participated in by {data.account?.name ?? 'Unknown'}!"
/>

<section class="flex flex-col justify-center items-center w-full">
	<div class="flex flex-col justify-center items-center mx-4 sm:w-full md:w-[90%] lg:w-[80%]">
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

			<div class="flex flex-row items-center gap-2 my-2 mt-4">
				<Switch bind:checked={timeType} />
				<span>Show Real Life Time</span>
			</div>
		</div>

		<Accordion.Root type="multiple" class="max-w-6xl w-full mx-4 items-center">
			{#each Object.entries(data.years ?? {}).sort((a, b) => +b[0] - +a[0]) as [year, conts] (year)}
				<Accordion.Item value="{year} ">
					<Accordion.Trigger class="flex justify-center hover:no-underline">
						<div class="flex flex-col gap-2 justify-center items-center mr-4">
							<div class="flex flex-row justify-between items-center w-full">
								<p class="text-xl font-semibold flex-1 text-start">Year {year}</p>
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
						<div class="flex flex-wrap gap-4 justify-center">
							{#each conts ?? [] as contest (`${contest.timestamp ?? 0}${contest?.crop ?? 0}`)}
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
			<div class="flex flex-col justify-center items-center w-full">
				<p class="text-2xl font-bold">No Contests</p>
				<p class="text-lg">This player has not participated in any contests.</p>
			</div>
		{/if}
	</div>
</section>
