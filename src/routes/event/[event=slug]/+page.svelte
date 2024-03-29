<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import * as Accordion from '$ui/accordion';
	import type { PageData } from './$types';
	import { ExternalLink, Users } from 'lucide-svelte/icons';
	import { onMount } from 'svelte';
	import { getCountdown } from '$lib/format';
	import { page } from '$app/stores';
	import Eventmember from './eventmember.svelte';
	import Linebreaks from '$comp/events/linebreaks.svelte';
	import Guildicon from '$comp/stats/discord/guildicon.svelte';

	export let data: PageData;

	$: ({ event = {}, members } = data);

	$: banner =
		'https://cdn.discordapp.com/splashes/1096051612373487687/dc2f5296bdb34b3adc580df6c50c56cf.png?size=1280';

	$: time = Date.now();
	$: start = +(event.startTime ?? 0) * 1000;
	$: end = +(event.endTime ?? 0) * 1000;
	$: running = start < time && end > time;

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
	imageUrl={data.guild.icon
		? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild?.icon}.webp`
		: undefined}
/>

<main class="flex flex-col justify-center items-center gap-8 mb-16" data-sveltekit-preload-data="tap">
	<div
		class="relative flex flex-col items-center gap-4 justify-center w-full h-96 bg-center bg-cover bg-no-repeat"
		style="background-image: url('{banner}')"
	>
		<div class="flex flex-row p-4 items-center bg-zinc-900/75 gap-4 mt-32 rounded-lg">
			<Guildicon guild={data.guild} size={16} />
			<h1 class="text-4xl mx-8 text-white">
				{data.event?.name}
			</h1>
			<Button href="https://discord.gg/{data.guild.inviteCode}" variant="secondary">
				<ExternalLink size={16} />
			</Button>
		</div>
		<div class="flex flex-col p-4 items-center bg-zinc-900/75 mb-32 rounded-lg text-white">
			<p class="text-lg font-light">
				{#if start > time}
					Event Starts In
				{:else}
					Event Ends In
				{/if}
			</p>
			<h1 class="text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-semibold font-sans select-none">
				{#if start > time}
					{getCountdown(start - time + time) ?? 'Event Started!'}
				{:else}
					{getCountdown(end + time - time) ?? 'Event Over!'}
				{/if}
			</h1>
		</div>
	</div>

	<div class="flex flex-col lg:flex-row gap-8 max-w-6xl w-full">
		<section class="flex flex-1 flex-col gap-4 max-w-md bg-primary-foreground rounded-md p-8">
			<h2 class="text-3xl">{event.name}</h2>
			<div class="flex flex-col gap-4">
				<div class="flex flex-row gap-2 font-semibold items-center text-lg">
					<span>{new Date(start).toLocaleDateString()}</span>
					<span
						>{new Date(start).toLocaleTimeString(undefined, {
							hour: 'numeric',
							minute: '2-digit',
						})}</span
					>
					<span> - </span>
					<span>{new Date(end).toLocaleDateString()}</span>
					<span
						>{new Date(end).toLocaleTimeString(undefined, {
							hour: 'numeric',
							minute: '2-digit',
						})}</span
					>
				</div>
				<p><Linebreaks text={event.description ?? ''} /></p>
				{#if event.prizeInfo}
					<p><strong>Prizes</strong></p>
					<p><Linebreaks text={event.prizeInfo ?? ''} /></p>
				{/if}
				<p><strong>Rules</strong></p>
				{#if event.rules}
					<p>
						<Linebreaks text={event.rules ?? ''} />
					</p>
				{/if}
				<a href="#agreement" class="text-blue-500 underline">Event Agreement</a>
				<div class="flex flex-row justify-center gap-2 mt-4">
					<Button href="{$page.url.pathname}/join" variant="secondary">
						<p class="mr-2">Join Discord Server</p>
						<ExternalLink size={16} />
					</Button>
					<Button href="{$page.url.pathname}/join" color="green">Join Event</Button>
				</div>
			</div>
		</section>
		<section class="flex flex-1 flex-col gap-4 items-center bg-primary-foreground rounded-md p-8">
			<div class="flex flex-row gap-8 items-center justify-center w-full">
				<h2 class="text-2xl">Members</h2>
				<div class="flex flex-row gap-2 font-semibold items-center">
					<p class="text-2xl">
						{members.length?.toLocaleString()}
					</p>
					<Users />
				</div>
			</div>
			{#if members.length > 0}
				<div class="flex flex-wrap md:mx-32 max-w-7xl gap-4 w-full">
					<Accordion.Root class="w-full text-black dark:text-white">
						{#each members.slice(0, memberLimit) as member, i}
							<Accordion.Item value={i.toString()}>
								<Eventmember {member} rank={i + 1} {running} />
							</Accordion.Item>
						{/each}
					</Accordion.Root>
				</div>
				<div class="flex flex-row gap-2 justify-center">
					<Button href="{$page.url.pathname}/leaderboard" color="alternative">
						<span class="mr-2">Leaderboard</span>
						<ExternalLink size={20} />
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
