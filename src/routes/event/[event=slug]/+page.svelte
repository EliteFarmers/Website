<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Accordion, Button } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import { ArrowUpRightFromSquareOutline, UserGroupSolid } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { getCountdown, getRelativeTimeString } from '$lib/format';
	import { page } from '$app/stores';
	import Eventmember from './eventmember.svelte';

	export let data: PageData;

	$: ({ event, guild, members } = data);

	$: banner =
		'https://cdn.discordapp.com/splashes/1096051612373487687/dc2f5296bdb34b3adc580df6c50c56cf.png?size=1280';

	$: iconUrl = `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.${
		data.guild.icon?.startsWith('a_') ? `gif` : `webp`
	}`;

	$: time = Date.now();
	$: start = +(event.startTime ?? 0) * 1000;
	$: end = +(event.endTime ?? 0) * 1000;

	let memberLimit = 10;

	onMount(() => {
		const interval = setInterval(() => {
			time = Date.now();
		}, 500);

		return () => clearInterval(interval);
	});
</script>

<Head
	title={event.name || 'Farming Weight Event'}
	description={`View the Event happening in ${data.guild.name}!\n${event.description}`}
	imageUrl={`https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild?.icon}.webp`}
/>

<main class="flex flex-col justify-center items-center gap-8 mb-16" data-sveltekit-preload-data="tap">
	<div
		class="relative flex flex-col items-center gap-4 justify-center w-full h-96 bg-center bg-cover bg-no-repeat"
		style="background-image: url('{banner}')"
	>
		<div class="flex flex-row p-4 items-center bg-zinc-900/75 gap-4 mt-32 rounded-lg">
			<img class="w-16 h-16" src={iconUrl} alt="Guild Icon" />
			<h1 class="text-4xl mx-8 text-white">
				{data.event?.name}
			</h1>
			<Button size="md" href="https://discord.gg/{data.guild.inviteCode}" color="blue">
				<ArrowUpRightFromSquareOutline size="md" />
			</Button>
		</div>
		<div class="flex flex-col p-4 items-center bg-zinc-900/75 mb-32 rounded-lg">
			<p class="text-lg font-light">
				{#if start > time}
					Event Starts In
				{:else}
					Event Ends In
				{/if}
			</p>
			<h1 class="text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-semibold font-sans text-white select-none">
				{#if start > time}
					{getCountdown(start - time + time) ?? 'Event Started!'}
				{:else}
					{getCountdown(end + time - time) ?? 'Event Over!'}
				{/if}
			</h1>
		</div>
	</div>

	<div class="flex flex-col lg:flex-row gap-8 max-w-6xl">
		<section class="flex flex-1 basis-1/3 flex-col gap-4 max-w-64 bg-gray-100 dark:bg-zinc-800 rounded-md p-8">
			<h2 class="text-3xl">{event.name}</h2>
			<div class="flex flex-col gap-4">
				<p>{event.description}</p>
				<p><strong>Rules</strong></p>
				{#if event.rules}
					<p>
						{event.rules}
					</p>
				{/if}
				<a href="#agreement" class="text-blue-500 underline">Event Agreement</a>
				{#if event.prizeInfo}
					<p><strong>Prizes</strong></p>
					<p>{event.prizeInfo}</p>
				{/if}
				<div class="flex flex-row justify-center gap-2 mt-4">
					<Button href="{$page.url.pathname}/join" color="blue">
						<p class="mr-2">Join Discord Server</p>
						<ArrowUpRightFromSquareOutline size="md" />
					</Button>
					<Button href="{$page.url.pathname}/join" color="green">Join Event</Button>
				</div>
			</div>
		</section>
		<section class="flex flex-1 basis-1/3 flex-col gap-4 items-center bg-gray-100 dark:bg-zinc-800 rounded-md p-8">
			<div class="flex flex-row gap-8 items-center justify-center w-full">
				<h2 class="text-2xl">Members</h2>
				<div class="flex flex-row gap-2 font-semibold items-center z-10">
					<p class="text-2xl">
						{members.length?.toLocaleString()}
					</p>
					<UserGroupSolid size="lg" />
				</div>
			</div>
			{#if members.length > 0}
				<div class="flex flex-wrap md:mx-32 max-w-7xl gap-4 w-full">
					<Accordion flush={true} class="w-full text-black dark:text-white">
						{#each members.slice(0, memberLimit) as member, i}
							<Eventmember {member} rank={i + 1} />
						{/each}
					</Accordion>
				</div>
				<div class="flex flex-row gap-2 justify-center">
					{#if memberLimit === 10 && members.length > 10}
						<Button on:click={() => (memberLimit = 100)} color="alternative">Show More</Button>
					{:else if memberLimit === 100 && members.length > 10}
						<Button on:click={() => (memberLimit = 10)} color="alternative">Show Less</Button>
					{/if}
					<Button href="{$page.url.pathname}/leaderboard" color="alternative">
						<span class="mr-2">Leaderboard</span>
						<ArrowUpRightFromSquareOutline size="md" />
					</Button>
				</div>
			{:else}
				<p class="max-w-lg text-center my-16">
					This Event does not have any members signed up right now! Login to be the first!
				</p>
			{/if}
		</section>
	</div>

	<div class="flex flex-col gap-4 max-w-xl" id="agreement">
		<h2 class="text-3xl">Event Agreement</h2>
		<p>
			All members of the event are expected to follow all of <a
				href="https://hypixel.net/rules"
				class="underline text-blue-500">Hypixel's Server Rules.</a
			> Futhermore, all prizes specified are the responsibility of the Discord Server/Event Sponsor to payout. This
			website is not responsible for unpaid prizes. Please do get in contact however and we'll revoke event permissions
			from the responsible server if appropriate. This website does not take a cut of any prizes or act as a middleman.
		</p>
	</div>
</main>
