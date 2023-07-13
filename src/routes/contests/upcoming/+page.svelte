<script lang="ts">
	import Head from '$comp/head.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Upcoming from './upcoming.svelte';

	export let data: PageData;

	$: contests = Object.entries((data.contests ?? {}) as Record<number, string[]>) as [string, string[]][];
	$: seconds = Math.floor(Date.now() / 1000);

	$: current = contests.find(([time]) => +time < seconds && seconds <= +time + 1200);
	$: upcoming = contests.filter(([time]) => +time > seconds).map(([time, contest]) => [time, contest.sort()]);

	onMount(() => {
		const interval = setInterval(() => {
			seconds = Math.floor(Date.now() / 1000);
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<Head title={"Upcoming Contests"} description={'Upcoming Jacob\'s Contests for Hypixel Skyblock.'} />

<main class="flex flex-col justify-center items-center">
	<h1 class="text-4xl my-16">Upcoming Contests - Year {data.year}</h1>

	{#if contests.length === 0}
		<p>No upcoming contests have been provided yet! Try again later!</p>
	{:else}
		<div class="flex flex-col mx-8 w-full md:w-[70%] gap-4 justify-center items-center">
			{#if current}
				<Upcoming current={true} timestamp={+current[0]} crops={current[1]} currentSeconds={seconds} />
			{/if}
			{#each upcoming as [ timestamp, contest ] (timestamp)}
				<Upcoming timestamp={+timestamp} crops={contest} currentSeconds={seconds} />
			{/each}
		</div>
	{/if}

	<p class="py-16">This data is supplied by users of the mod <a class="underline" href="https://github.com/hannibal002/SkyHanni/">SkyHanni</a>. Thank you!</p>
</main>
