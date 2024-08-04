<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import type { PageData } from './$types';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Users from 'lucide-svelte/icons/users';
	import User from 'lucide-svelte/icons/user';
	import { onMount } from 'svelte';
	import { getCountdown } from '$lib/format';
	import { page } from '$app/stores';
	import Linebreaks from '$comp/events/linebreaks.svelte';
	import Guildicon from '$comp/stats/discord/guildicon.svelte';
	import EventType from '$comp/events/event-type.svelte';
	import EventData from '$comp/events/event-data.svelte';
	import EventTeamLeaderboard from '$comp/events/event-team-leaderboard.svelte';
	import EventLeaderboard from '$comp/events/event-leaderboard.svelte';
	import ArrowLeftRight from 'lucide-svelte/icons/arrow-left-right';

	export let data: PageData;

	$: ({ event = {} as typeof data.event, members, teams = [], joined, self } = data);

	$: banner =
		event.banner ??
		'https://cdn.discordapp.com/splashes/1096051612373487687/dc2f5296bdb34b3adc580df6c50c56cf.png?size=1280';

	$: time = Date.now();
	$: start = +(event.startTime ?? 0) * 1000;
	$: end = +(event.endTime ?? 0) * 1000;
	$: running = start < time && end > time;
	$: joinable = +(event.joinUntilTime ?? 0) * 1000 > Date.now() && !self?.disqualified;
	$: teamEvent = (teams?.length ?? 0) > 0;

	let memberLimit = 10;
	let swapMode = false;

	onMount(() => {
		const interval = setInterval(() => {
			time = Date.now();
		}, 500);

		return () => clearInterval(interval);
	});

	function swapLeaderboard() {
		swapMode = !swapMode;
	}

	$: topList = teamEvent
		? teams
				.slice(0, 5)
				.map((team, i) => `${i + 1}. ${team.name} • ${(+(team?.score ?? 0)).toLocaleString()}`)
				.join('\n')
		: members
				.slice(0, 5)
				.map((member, i) => `${i + 1}. ${member.playerName} • ${(+(member?.score ?? 0)).toLocaleString()}`)
				.join('\n');

	$: description = `View the ${running ? 'Event happening' : 'past Event'} in ${data.guild?.name}!\n\n${topList}`;
</script>

<Head
	title={event.name || 'Farming Weight Event'}
	{description}
	imageUrl={data.guild?.icon
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
			<h1 class="text-xl xs:text-2xl sm:text-3xl md:text-4xl mx-8 text-white">
				{data.event?.name}
			</h1>
			<Button href="/server/{event.guildId}/join" variant="link">
				<ExternalLink size={16} class="text-white" />
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

	<div class="flex flex-col lg:flex-row gap-8 max-w-6xl w-full items-center lg:items-start mx-4">
		<section
			class="flex flex-1 flex-col justify-between gap-4 max-w-md bg-primary-foreground rounded-md p-8 basis-1"
		>
			<h2 class="text-3xl">{event.name}</h2>
			<div class="flex flex-col gap-4">
				<div class="flex flex-row gap-2 font-semibold items-center text-sm md:text-lg">
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
				<EventType type={event.type ?? 1} />
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
				<EventData {event} />
				<a href="#agreement" class="text-blue-500 underline">Event Agreement</a>
				<div class="flex flex-wrap justify-center gap-2 mt-4">
					<Button href="/server/{event.guildId}" variant="secondary">
						<p>Back To Server</p>
					</Button>
					<Button href="/server/{event.guildId}/join" variant="secondary">
						<p class="mr-2">Join Discord Server</p>
						<ExternalLink size={16} />
					</Button>
					{#if joinable}
						<Button href="{$page.url.pathname}/membership">
							{#if joined}
								My Membership
							{:else}
								Join Event
							{/if}
						</Button>
					{/if}
				</div>
				{#if self?.disqualified}
					<div class="flex flex-col gap-1 justify-start text-sm">
						<p class="text-red-500 text-lg">You have been removed from this event.</p>
						<p>Reason</p>
						<p class="p-2 bg-card rounded-sm">{self.notes ?? 'Unknown - Ask Server Staff'}</p>
					</div>
				{/if}
			</div>
		</section>
		<section class="flex flex-1 flex-col gap-4 items-center bg-primary-foreground rounded-md p-8 basis-1 w-full">
			<div class="flex flex-row gap-8 items-center justify-center w-full">
				{#if teamEvent}
					<Button on:click={swapLeaderboard} variant="secondary" size="sm">
						<ArrowLeftRight size={20} />
						<span class="sr-only">Swap Leaderboard</span>
					</Button>
				{/if}
				{#if !teamEvent || (teamEvent && swapMode)}
					<h2 class="text-3xl leading-none">Members</h2>
					<div class="flex flex-row gap-2 font-semibold items-center">
						<p class="text-2xl">
							{members.length?.toLocaleString()}
						</p>
						<User />
					</div>
				{:else}
					<h2 class="text-3xl leading-none">Teams</h2>
					<div class="flex flex-row gap-2 font-semibold items-center">
						<p class="text-2xl">
							{(teams?.length ?? 0).toLocaleString()}
						</p>
						<Users />
					</div>
				{/if}
			</div>
			<div class="flex flex-col justify-center md:mx-32 max-w-7xl gap-4 w-full">
				{#if (!teamEvent || (teamEvent && swapMode)) && members.length > 0}
					<EventLeaderboard {running} {event} members={members.slice(0, memberLimit)} />
					<div class="flex flex-row gap-2 justify-center">
						<Button href="{$page.url.pathname}/leaderboard" color="alternative">
							<span>View Leaderboard</span>
						</Button>
					</div>
				{:else if teamEvent && teams.length > 0}
					<EventTeamLeaderboard {running} {event} teams={teams.slice(0, memberLimit)} />
					<div class="flex flex-row gap-2 justify-center">
						<Button href="{$page.url.pathname}/leaderboard" color="alternative">
							<span>View Leaderboard</span>
						</Button>
					</div>
				{:else}
					<p class="max-w-lg text-center my-16">
						This Event does not have any members signed up right now! Login to be the first!
					</p>
				{/if}
			</div>
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
