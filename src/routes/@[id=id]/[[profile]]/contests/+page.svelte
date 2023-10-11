<script lang="ts">
	import Head from '$comp/head.svelte';
	import Contest from '$comp/stats/jacob/contest.svelte';
	import MedalCounts from '$comp/stats/jacob/medalcounts.svelte';
	import { getTimeStamp } from '$lib/format';
	import type { PageData } from './$types';

	import { Accordion, AccordionItem, Timeline, TimelineItemVertical, Toggle } from 'flowbite-svelte';

	let timeType = false;

	export let data: PageData;
</script>

<Head
	title="{data.account.name} | Jacob's Contests"
	description="View all {data.contestsCount} Jacob's Contests participated in by {data.account.name}"
/>

<main class="flex flex-col justify-center items-center w-full">
	<section class="flex flex-col justify-center items-center mx-4 sm:w-full md:w-[90%] lg:w-[80%]">
		<h1 class="text-4xl font-semibold text-center my-16">
			{data.account.name} | Jacob's Contests
		</h1>
		<MedalCounts
			participations={data.contestsCount}
			gold={data.member.jacob?.earnedMedals?.gold}
			silver={data.member.jacob?.earnedMedals?.silver}
			bronze={data.member.jacob?.earnedMedals?.bronze}
		/>

		<div class="flex flex-row align-middle my-2 mt-4">
			<Toggle bind:checked={timeType} label="Show All" size="large" />
			Show Real Life Time
		</div>

		<Timeline order="vertical" customClass="w-full">
			{#each Object.entries(data.years).sort((a, b) => +b[0] - +a[0]) as [year, conts], i (year)}
				<TimelineItemVertical
					title={'Year ' + year}
					date={new Date(getTimeStamp(+year - 1, 0, 0) * 1000).toLocaleDateString() +
						' - ' +
						new Date(getTimeStamp(+year - 1, 0, 0) * 1000).toLocaleDateString()}
				>
					<svelte:fragment slot="icon">
						<span
							class="flex absolute justify-center items-center w-6 h-6 bg-primary-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-primary-900"
						/>
					</svelte:fragment>

					<Accordion flush multiple defaultClass="">
						<AccordionItem open={i < 5}>
							<span slot="header" class="w-full px-4">
								<MedalCounts
									participations={conts?.length}
									gold={conts?.filter((c) => c.medal === 'gold').length}
									silver={conts?.filter((c) => c.medal === 'silver').length}
									bronze={conts?.filter((c) => c.medal === 'bronze').length}
								/>
							</span>
							<div class="flex flex-wrap gap-4">
								{#each conts ?? [] as contest (`${contest.timestamp ?? 0}${contest?.crop ?? 0}`)}
									<div class="basis-64">
										<Contest {contest} irlTime={timeType} />
									</div>
								{/each}
							</div>
						</AccordionItem>
					</Accordion>
				</TimelineItemVertical>
			{/each}
		</Timeline>
	</section>
</main>
