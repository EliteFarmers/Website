<script lang="ts">
	import { goto } from '$app/navigation';
	import { getSkyblockDate } from '$lib/format';
	import { Button } from '$ui/button';
	import { browser } from '$app/environment';
	import { Input } from '$ui/input';
	import Head from '$comp/head.svelte';
	import * as Card from '$ui/card';
	import { Label } from '$ui/label';

	let searchVal = '';

	function searchContests() {
		goto(`/@${searchVal}/contests`);
	}

	const date = getSkyblockDate(Date.now() / 1000);
	let yearVal = date.year - 1;
	let monthVal = date.month;
	let dayVal = date.day;

	function searchContest() {
		goto(`/contests/${yearVal}/${monthVal}/${dayVal}`);
	}

	function searchContestYear() {
		goto(`/contests/${yearVal}`);
	}

	function searchContestYearMonth() {
		goto(`/contests/${yearVal}/${monthVal}`);
	}

	$: searchStr = '';
	$: players = [] as string[];
	$: search(searchStr);

	async function search(query: string) {
		if (!browser) return [];

		try {
			const results = await fetch(`/api/search?q=${query}`);
			const json = await results.json();

			players = (json ?? []) as string[];
		} catch (e) {
			console.error(e);
		}
	}

	function lookUpPlayer() {
		if (!searchStr) return;
		goto(`/@${searchStr}/contests`);
	}
</script>

<Head
	title="Elite | Contests"
	description="Browse hundreds of thousands of contest participations set by fellow players!"
/>

<main class="flex flex-col justify-center items-center">
	<h1 class="text-4xl my-16">Jacob's Contests</h1>

	<div class="flex flex-col md:flex-row gap-8 items-stretch">
		<Card.Root class="max-w-md">
			<Card.Header>
				<Card.Title class="text-xl">View upcoming contests!</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="w-full mb-6 text-md">
					Contests coming this SkyBlock year! May take a moment to update after the new year.
				</p>
				<div class="flex justify-center">
					<Button href="/contests/upcoming" variant="default" size="lg">
						Upcoming Contests
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="max-w-md">
			<Card.Header>
				<Card.Title class="text-xl">View all contest participations from a player!</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col justify-between gap-4 h-full">
					<p class="w-full text-md">
						May take a moment to load for some players with thousands of contests.
					</p>
					<form class="flex flex-row gap-2 justify-center items-center" on:submit|preventDefault={lookUpPlayer}>
						<Input 
							placeholder="Search for a player" 
							bind:value={searchStr} 
							type="text"
						/>
						<Button variant="default" type="submit" size="lg">
							Search
						</Button>
					</form>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="my-8 mb-32 flex justify-center w-full max-w-xl">
		<Card.Root class="w-full max-w-4xl">
			<Card.Header>
				<Card.Title class="text-xl">Delve Through The Archives</Card.Title>
			</Card.Header>
			<Card.Content class="w-full max-w-xl">
				<div class="flex flex-col md:flex-row gap-8 items-center justify-between w-full">
					<p class="text-md my-4">
						Look through the rankings of every known participant in every known contest. Also try clicking
						on contest participations elsewhere on the site to jump to that contest.
					</p>
					<div class="flex-1 flex flex-col gap-4 items-end">
						<form on:submit|preventDefault={searchContestYear} class="flex gap-2 items-center justify-center">
							<div>
								<Label for="yearOnly"><span class="text-sm">Skyblock Year</span></Label>
								<Input
									id="yearOnly"
									placeholder="Day"
									bind:value={yearVal}
									class="dark:bg-zinc-700"
								/>
							</div>
							<Button class="!p-2.5 mt-4" href="/contests/{yearVal}/records" color="green">
								<!-- <OrdoredListOutline class="w-5 h-5" />
								<Popover>Top Scores</Popover> -->
								Records
							</Button>
							<Button class="!p-2.5 mt-4" type="submit" name="Search">
								<svg
									class="w-5 h-5"
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
						<form
							on:submit|preventDefault={searchContestYearMonth}
							class="flex gap-2 items-center justify-center"
						>
							<div>
								<Label for="yearMonth"><span class="text-sm">Skyblock Year</span></Label>
								<Input
									id="yearMonth"
									placeholder="Day"
									bind:value={yearVal}
									class="dark:bg-zinc-700"
								/>
							</div>
							/
							<div>
								<Label for="monthYear"><span class="text-sm">Skyblock Month</span></Label>
								<Input
									id="monthYear"
									placeholder="Day"
									bind:value={monthVal}
									class="dark:bg-zinc-700"
								/>
							</div>
	
							<Button class="!p-2.5 mt-4" type="submit" name="Search">
								<svg
									class="w-5 h-5"
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
						<form on:submit|preventDefault={searchContest} class="flex gap-2 items-center justify-center">
							<div>
								<Label for="year"><span class="text-sm">SB Year</span></Label>
								<Input
									id="year"
									placeholder="Day"
									bind:value={yearVal}
									class="dark:bg-zinc-700"
								/>
							</div>
							/
							<div>
								<Label for="month"><span class="text-sm">SB Month</span></Label>
								<Input
									id="month"
									placeholder="Day"
									bind:value={monthVal}
									class="dark:bg-zinc-700"
								/>
							</div>
							/
							<div>
								<Label for="day"><span class="text-sm">SB Day</span></Label>
								<Input id="day" placeholder="Day" bind:value={dayVal} class="dark:bg-zinc-700" />
							</div>
	
							<Button class="!p-2.5 mt-4" type="submit" name="Search">
								<svg
									class="w-5 h-5"
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
						<a
							href="/contests/{yearVal + 2}/{monthVal + 1}/{dayVal + 1}"
							class="underline text-gray-500 text-sm leading-none">Jump to most recent contest</a
						>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</main>
