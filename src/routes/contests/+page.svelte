<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import Head from '$comp/head.svelte';
	import * as Card from '$ui/card';
	import { Label } from '$ui/label';
	import { SkyBlockTime } from 'farming-weight';

	const date = SkyBlockTime.now;
	let yearVal = date.year;
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

	<div class="flex flex-col md:flex-row gap-8 items-stretch max-w-4xl">
		<Card.Root class="max-w-md">
			<Card.Header>
				<Card.Title class="text-xl">View upcoming contests!</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="w-full mb-6 text-md">
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
				<div class="flex flex-col justify-between gap-4 h-full">
					<p class="w-full text-md">May take a moment to load for some players with thousands of contests.</p>
					<form
						class="flex flex-row gap-2 justify-center items-center"
						on:submit|preventDefault={lookUpPlayer}
					>
						<Input placeholder="Search for a player" bind:value={searchStr} type="text" />
						<Button variant="default" type="submit" size="lg">Search</Button>
					</form>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="my-8 mb-32 flex justify-center w-full max-w-4xl">
		<Card.Root class="w-full">
			<Card.Title class="text-xl p-6 pb-0">Delve Through The Archives</Card.Title>
			<div class="flex flex-col md:flex-row p-6 gap-8 items-start justify-between w-full">
				<p class="flex-1 text-md my-4">
					Look through the rankings of every known participant in every known contest. Also try clicking on
					contest participations elsewhere on the site to jump to that contest.
				</p>
				<div class="flex-1 flex flex-col gap-4 items-end">
					<form on:submit|preventDefault={searchContestYear} class="flex gap-2 items-center justify-center">
						<div>
							<Label for="yearOnly"><span class="text-sm">Skyblock Year</span></Label>
							<Input id="yearOnly" placeholder="Day" bind:value={yearVal} class="dark:bg-zinc-700" />
						</div>
						<Button class="!p-2.5 mt-6" href="/contests/{yearVal}/records" color="green">
							<!-- <OrdoredListOutline class="w-5 h-5" />
							<Popover>Top Scores</Popover> -->
							Records
						</Button>
						<Button class="!p-2.5 mt-6" type="submit" name="Search">
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
							<Input id="yearMonth" placeholder="Day" bind:value={yearVal} class="dark:bg-zinc-700" />
						</div>
						<span class="mt-4">/</span>
						<div>
							<Label for="monthYear"><span class="text-sm">Skyblock Month</span></Label>
							<Input id="monthYear" placeholder="Day" bind:value={monthVal} class="dark:bg-zinc-700" />
						</div>

						<Button class="!p-2.5 mt-6" type="submit" name="Search">
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
							<Input id="year" placeholder="Day" bind:value={yearVal} class="dark:bg-zinc-700" />
						</div>
						<span class="mt-4">/</span>
						<div>
							<Label for="month"><span class="text-sm">SB Month</span></Label>
							<Input id="month" placeholder="Day" bind:value={monthVal} class="dark:bg-zinc-700" />
						</div>
						<span class="mt-4">/</span>
						<div>
							<Label for="day"><span class="text-sm">SB Day</span></Label>
							<Input id="day" placeholder="Day" bind:value={dayVal} class="dark:bg-zinc-700" />
						</div>

						<Button class="!p-2.5 mt-6" type="submit" name="Search">
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
				</div>
			</div>
		</Card.Root>
	</div>
</main>
