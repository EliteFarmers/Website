<script lang="ts">
	import { goto } from '$app/navigation';
	import Head from '$comp/head.svelte';
	import { Button, Card, Input, Label } from 'flowbite-svelte';

	let searchVal = '';
	function search() {
		goto(`/@${searchVal}/contests`);
	}

	let yearVal = 101;
	let monthVal = 10;
	let dayVal = 26;

	function searchContest() {
		goto(`/contests/${yearVal}/${monthVal}/${dayVal}`);
	}

	function searchContestYear() {
		goto(`/contests/${yearVal}`);
	}

	function searchContestYearMonth() {
		goto(`/contests/${yearVal}/${monthVal}`);
	}
</script>

<Head
	title="Elite | Contests"
	description="Browse hundreds of thousands of contest participations set by fellow players!"
/>

<main class="flex flex-col justify-center items-center">
	<h1 class="text-4xl my-16">Jacob's Contests</h1>

	<div class="flex flex-col md:flex-row gap-8 items-center">
		<Card color="none" class="bg-gray-100 dark:bg-zinc-800" border={false}>
			<h2 class="font-semibold text-lg">View upcoming contests from this Skyblock Year!</h2>
			<p class="text-md my-4">May take some time for the contests to appear when the year resets.</p>
			<Button href="/contests/upcoming" color="blue" size="xs">
				<span class="font-semibold text-lg">Upcoming Contests</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-5 h-5 ml-2"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
					/></svg
				>
			</Button>
		</Card>
		<Card color="none" class="bg-gray-100 dark:bg-zinc-800" border={false}>
			<h2 class="font-semibold text-lg">View all contest participations from a player!</h2>
			<p class="text-md my-4">May take a moment to load for some players with thousands of contests.</p>
			<form on:submit|preventDefault={search} class="flex gap-2 items-center justify-center">
				<Input let:props placeholder="Player name" size="md" class="dark:bg-zinc-800">
					<input type="text" {...props} bind:value={searchVal} />
				</Input>
				<Button class="!p-2.5 h-full" type="submit" name="Search">
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
		</Card>
	</div>

	<div class="my-8 mb-32 flex justify-center md:w-[50rem]">
		<Card color="none" class="bg-gray-100 dark:bg-zinc-800 min-w-full" border={false}>
			<div class="flex flex-col md:flex-row gap-8 items-center justify-center">
				<div class="flex-1">
					<h2 class="font-semibold text-lg">Delve Through The Archives</h2>
					<p class="text-md my-4">
						Look through the rankings of every known participant in every known contest. Also try clicking
						on contest participations elsewhere on the site to jump to that contest.
					</p>
				</div>
				<div class="flex-1 flex flex-col gap-4 items-end">
					<form on:submit|preventDefault={searchContestYear} class="flex gap-2 items-center justify-center">
						<div>
							<Label for="yearOnly"><span class="text-sm">Skyblock Year</span></Label>
							<Input
								id="yearOnly"
								placeholder="Day"
								size="md"
								bind:value={yearVal}
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
					<form
						on:submit|preventDefault={searchContestYearMonth}
						class="flex gap-2 items-center justify-center"
					>
						<div>
							<Label for="yearMonth"><span class="text-sm">Skyblock Year</span></Label>
							<Input
								id="yearMonth"
								placeholder="Day"
								size="md"
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
								size="md"
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
								size="md"
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
								size="md"
								bind:value={monthVal}
								class="dark:bg-zinc-700"
							/>
						</div>
						/
						<div>
							<Label for="day"><span class="text-sm">SB Day</span></Label>
							<Input id="day" placeholder="Day" size="md" bind:value={dayVal} class="dark:bg-zinc-700" />
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
				</div>
			</div>
		</Card>
	</div>
</main>
