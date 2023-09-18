<script lang="ts">
	import Head from '$comp/head.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Upcoming from './upcoming.svelte';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import Cropselect from '$comp/stats/contests/cropselect.svelte';

	export let data: PageData;

	$: contests = Object.entries((data.contests ?? {}) as Record<number, string[]>) as [string, string[]][];
	$: seconds = Math.floor(Date.now() / 1000);

	$: current = contests.find(([time]) => +time < seconds && seconds <= +time + 1200);
	$: upcoming = contests.filter(([time]) => +time > seconds).map(([time, contest]) => [time, contest.sort()]) as [
		string,
		string[]
	][];

	$: crops = Object.entries(PROPER_CROP_TO_IMG).sort(([a], [b]) => a.localeCompare(b));
	$: cactus = false;
	$: carrot = false;
	$: cocoa = false;
	$: melon = false;
	$: mushroom = false;
	$: netherwart = false;
	$: potato = false;
	$: pumpkin = false;
	$: sugarcane = false;
	$: wheat = false;

	$: anySelected = false;

	$: selected = {
		Cactus: cactus,
		Carrot: carrot,
		'Cocoa Beans': cocoa,
		Melon: melon,
		Mushroom: mushroom,
		'Nether Wart': netherwart,
		Potato: potato,
		Pumpkin: pumpkin,
		'Sugar Cane': sugarcane,
		Wheat: wheat,
	} as Record<string, boolean>;

	$: {
		anySelected = Object.values(selected).some((v) => v);
	}

	onMount(() => {
		const interval = setInterval(() => {
			seconds = Math.floor(Date.now() / 1000);
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<Head title={'Upcoming Contests'} description={"Upcoming Jacob's Contests for Hypixel Skyblock."} />

<main class="flex flex-col justify-center items-center">
	<h1 class="text-4xl my-16">Upcoming Contests - Year {data.year}</h1>

	{#if upcoming.length === 0}
		<p>No upcoming contests have been provided yet! Try again later!</p>
	{:else}
		<div class="flex flex-wrap gap-2 mb-8">
			<!-- Not amazing but an easy way to bind the values -->
			<Cropselect bind:clicked={cactus} src={crops[0][1]} alt={crops[0][0]} />
			<Cropselect bind:clicked={carrot} src={crops[1][1]} alt={crops[1][0]} />
			<Cropselect bind:clicked={cocoa} src={crops[2][1]} alt={crops[2][0]} />
			<Cropselect bind:clicked={melon} src={crops[3][1]} alt={crops[3][0]} />
			<Cropselect bind:clicked={mushroom} src={crops[4][1]} alt={crops[4][0]} />
			<Cropselect bind:clicked={netherwart} src={crops[5][1]} alt={crops[5][0]} />
			<Cropselect bind:clicked={potato} src={crops[6][1]} alt={crops[6][0]} />
			<Cropselect bind:clicked={pumpkin} src={crops[7][1]} alt={crops[7][0]} />
			<Cropselect bind:clicked={sugarcane} src={crops[8][1]} alt={crops[8][0]} />
			<Cropselect bind:clicked={wheat} src={crops[9][1]} alt={crops[9][0]} />
		</div>
		<div class="flex flex-col mx-8 w-full md:w-[70%] gap-4 justify-center items-center">
			{#if current && (!anySelected || current[1].some((c) => selected[c]))}
				<Upcoming current={true} timestamp={+current[0]} crops={current[1]} currentSeconds={seconds} />
			{/if}
			{#each upcoming as [timestamp, contest] (timestamp)}
				{#if !anySelected || contest.some((c) => selected[c])}
					<Upcoming timestamp={+timestamp} crops={contest} currentSeconds={seconds} />
				{/if}
			{/each}
		</div>
	{/if}

	<p class="py-16 max-w-2xl text-center">
		This data is supplied by users of the mod <a class="underline" href="https://github.com/hannibal002/SkyHanni/"
			>SkyHanni</a
		>. Open your calender at the start of the skyblock year to share them with the website and other SkyHanni users!
		No data is sent without your consent when using the mod.
	</p>
</main>
