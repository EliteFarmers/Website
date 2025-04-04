<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import Head from '$comp/head.svelte';
	import * as Card from '$ui/card';
	import { Label } from '$ui/label';
	import { SkyBlockTime } from 'farming-weight';

	const date = SkyBlockTime.now;
	let yearVal = $state(date.year);
	let monthVal = $state(date.month);
	let dayVal = $state(date.day);

	function searchContest(event: Event) {
		event.preventDefault();
		goto(`/contests/${yearVal}/${monthVal}/${dayVal}`);
	}

	function searchContestYear(event: Event) {
		event.preventDefault();
		goto(`/contests/${yearVal}`);
	}

	function searchContestYearMonth(event: Event) {
		event.preventDefault();
		goto(`/contests/${yearVal}/${monthVal}`);
	}

	let searchStr = $state('');

	function lookUpPlayer(event: Event) {
		event.preventDefault();
		if (!searchStr) return;
		goto(`/@${searchStr}/contests`);
	}
</script>

<Head title="Contests" description="Browse hundreds of thousands of contest participations set by fellow players!" />

<div class="flex flex-col items-center justify-center">
	<h1 class="my-16 text-4xl">Jacob's Contests</h1>

	<div class="flex max-w-4xl flex-col items-stretch gap-8 md:flex-row">
		<Card.Root class="flex max-w-md flex-col">
			<Card.Header>
				<Card.Title class="text-xl">View upcoming contests!</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-1 flex-col justify-between">
				<p class="text-md mb-6 w-full">
					Contests coming this SkyBlock year! May take a moment to update after the new year.
				</p>
				<div class="flex justify-center">
					<Button href="/contests/upcoming" variant="default" size="lg">Upcoming Contests</Button>
				</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="max-w-md">
			<Card.Header>
				<Card.Title class="text-xl">View all contest participations from a player!</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex h-full flex-col justify-between gap-4">
					<p class="text-md w-full">May take a moment to load for some players with thousands of contests.</p>
					<form class="flex flex-row items-center justify-center gap-2" onsubmit={lookUpPlayer}>
						<Input placeholder="Search for a player" bind:value={searchStr} type="text" />
						<Button variant="default" type="submit" size="lg">Search</Button>
					</form>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="my-8 mb-32 flex w-full max-w-4xl justify-center">
		<Card.Root class="w-full">
			<Card.Title class="p-6 pb-0 text-xl">Delve Through The Archives</Card.Title>
			<div class="flex w-full flex-col items-start justify-between gap-8 p-6 md:flex-row">
				<p class="text-md my-4 flex-1">
					Look through the rankings of every known participant in every known contest. Also try clicking on
					contest participations elsewhere on the site to jump to that contest.
				</p>
				<div class="flex flex-1 flex-col items-end gap-4">
					<form onsubmit={searchContestYear} class="flex items-center justify-center gap-2">
						<div>
							<Label for="yearOnly"><span class="text-sm">Skyblock Year</span></Label>
							<Input id="yearOnly" placeholder="Day" bind:value={yearVal} />
						</div>
						<Button class="mt-6 !p-2.5" href="/contests/{yearVal}/records" color="green">
							<!-- <OrdoredListOutline class="w-5 h-5" />
							<Popover>Top Scores</Popover> -->
							Records
						</Button>
						<Button class="mt-6 !p-2.5" type="submit" name="Search">
							<svg
								class="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/></svg
							>
						</Button>
					</form>
					<form onsubmit={searchContestYearMonth} class="flex items-center justify-center gap-2">
						<div>
							<Label for="yearMonth"><span class="text-sm">Skyblock Year</span></Label>
							<Input id="yearMonth" placeholder="Day" bind:value={yearVal} />
						</div>
						<span class="mt-4">/</span>
						<div>
							<Label for="monthYear"><span class="text-sm">Skyblock Month</span></Label>
							<Input id="monthYear" placeholder="Day" bind:value={monthVal} />
						</div>

						<Button class="mt-6 !p-2.5" type="submit" name="Search">
							<svg
								class="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/></svg
							>
						</Button>
					</form>
					<form onsubmit={searchContest} class="flex items-center justify-center gap-2">
						<div>
							<Label for="year"><span class="text-sm">SB Year</span></Label>
							<Input id="year" placeholder="Day" bind:value={yearVal} />
						</div>
						<span class="mt-4">/</span>
						<div>
							<Label for="month"><span class="text-sm">SB Month</span></Label>
							<Input id="month" placeholder="Day" bind:value={monthVal} />
						</div>
						<span class="mt-4">/</span>
						<div>
							<Label for="day"><span class="text-sm">SB Day</span></Label>
							<Input id="day" placeholder="Day" bind:value={dayVal} />
						</div>

						<Button class="mt-6 !p-2.5" type="submit" name="Search">
							<svg
								class="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/></svg
							>
						</Button>
					</form>
				</div>
			</div>
		</Card.Root>
	</div>
</div>
