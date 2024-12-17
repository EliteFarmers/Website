<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import type { PageData } from './$types';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Users from 'lucide-svelte/icons/users';
	import User from 'lucide-svelte/icons/user';
	import { onMount } from 'svelte';
	import { getCountdown } from '$lib/format';
	import { page } from '$app/state';
	import Linebreaks from '$comp/events/linebreaks.svelte';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import EventType from '$comp/events/event-type.svelte';
	import EventData from '$comp/events/event-data.svelte';
	import EventTeamLeaderboard from '$comp/events/event-team-leaderboard.svelte';
	import EventLeaderboard from '$comp/events/event-leaderboard.svelte';
	import ArrowLeftRight from 'lucide-svelte/icons/arrow-left-right';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { event = {} as typeof data.event, members, teams = [], joined, self, guild } = $derived(data);

	let banner = $derived(event.banner?.url ?? guild?.banner?.url);
	let time = $state(Date.now());
	let start = $derived(+(event.startTime ?? 0) * 1000);
	let end = $derived(+(event.endTime ?? 0) * 1000);
	let running = $derived(start < time && end > time);
	let joinable = $derived(+(event.joinUntilTime ?? 0) * 1000 > Date.now() && !self?.disqualified);
	let teamEvent = $derived((teams?.length ?? 0) > 0);

	let memberLimit = 10;
	let swapMode = $state(false);

	onMount(() => {
		const interval = setInterval(() => {
			time = Date.now();
		}, 500);

		return () => clearInterval(interval);
	});

	function swapLeaderboard() {
		swapMode = !swapMode;
	}

	let topList = $derived(
		teamEvent
			? teams
					.slice(0, 5)
					.map((team, i) => `${i + 1}. ${team.name} • ${(+(team?.score ?? 0)).toLocaleString()}`)
					.join('\n')
			: members
					.slice(0, 5)
					.map((member, i) => `${i + 1}. ${member.playerName} • ${(+(member?.score ?? 0)).toLocaleString()}`)
					.join('\n')
	);

	let description = $derived(
		`View the ${running ? 'Event happening' : 'past Event'} in ${data.guild?.name}!\n\n${topList}`
	);
</script>

<Head title={event.name || 'Farming Weight Event'} {description} imageUrl={data.guild?.icon?.url} />

<main class="mb-16 flex flex-col items-center justify-center gap-8" data-sveltekit-preload-data="tap">
	<div
		class="relative flex h-96 w-full flex-col items-center justify-center gap-4 bg-cover bg-center bg-no-repeat"
		style={banner ? `background-image: url('${banner}')` : ''}
	>
		<div class="mt-32 flex flex-row items-center gap-4 rounded-lg bg-zinc-900/75 p-4">
			<GuildIcon guild={data.guild} size={16} />
			<h1 class="xs:text-2xl mx-8 text-xl text-white sm:text-3xl md:text-4xl">
				{data.event?.name}
			</h1>
			<Button href="/server/{event.guildId}/join" variant="link">
				<ExternalLink size={16} class="text-white" />
			</Button>
		</div>
		<div class="mb-32 flex flex-col items-center rounded-lg bg-zinc-900/75 p-4 text-white">
			<p class="text-lg font-light">
				{#if start > time}
					Event Starts In
				{:else}
					Event Ends In
				{/if}
			</p>
			<h1 class="select-none font-sans text-2xl font-semibold sm:text-4xl md:text-6xl lg:text-8xl">
				{#if start > time}
					{getCountdown(start - time + time) ?? 'Event Started!'}
				{:else}
					{getCountdown(end + time - time) ?? 'Event Over!'}
				{/if}
			</h1>
		</div>
	</div>

	<div class="mx-4 flex w-full max-w-6xl flex-col items-center gap-8 lg:flex-row lg:items-start">
		<section
			class="flex max-w-md flex-1 basis-1 flex-col justify-between gap-4 rounded-md bg-primary-foreground p-8"
		>
			<h2 class="text-3xl">{event.name}</h2>
			<div class="flex flex-col gap-4">
				<div class="flex flex-row items-center gap-2 text-sm font-semibold md:text-lg">
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
				<div class="mt-4 flex flex-wrap justify-center gap-2">
					<Button href="/server/{event.guildId}" variant="secondary">
						<p>Back To Server</p>
					</Button>
					<Button href="/server/{event.guildId}/join" variant="secondary">
						<p class="mr-2">Join Discord Server</p>
						<ExternalLink size={16} />
					</Button>
					{#if joinable}
						<Button href="{page.url.pathname}/membership">
							{#if joined}
								My Membership
							{:else}
								Join Event
							{/if}
						</Button>
					{/if}
				</div>
				{#if self?.disqualified}
					<div class="flex flex-col justify-start gap-1 text-sm">
						<p class="text-lg text-red-500">You have been removed from this event.</p>
						<p>Reason</p>
						<p class="rounded-sm bg-card p-2">{self.notes ?? 'Unknown - Ask Server Staff'}</p>
					</div>
				{/if}
			</div>
		</section>
		<section class="flex w-full flex-1 basis-1 flex-col items-center gap-4 rounded-md bg-primary-foreground p-8">
			<div class="flex w-full flex-row items-center justify-center gap-8">
				{#if teamEvent}
					<Button onclick={swapLeaderboard} variant="secondary" size="sm">
						<ArrowLeftRight size={20} />
						<span class="sr-only">Swap Leaderboard</span>
					</Button>
				{/if}
				{#if !teamEvent || (teamEvent && swapMode)}
					<h2 class="text-3xl leading-none">Members</h2>
					<div class="flex flex-row items-center gap-2 font-semibold">
						<p class="text-2xl">
							{members.length?.toLocaleString()}
						</p>
						<User />
					</div>
				{:else}
					<h2 class="text-3xl leading-none">Teams</h2>
					<div class="flex flex-row items-center gap-2 font-semibold">
						<p class="text-2xl">
							{(teams?.length ?? 0).toLocaleString()}
						</p>
						<Users />
					</div>
				{/if}
			</div>
			<div class="flex w-full max-w-7xl flex-col justify-center gap-4 md:mx-32">
				{#if (!teamEvent || (teamEvent && swapMode)) && members.length > 0}
					<EventLeaderboard {running} {event} members={members.slice(0, memberLimit)} />
					<div class="flex flex-row justify-center gap-2">
						<Button href="{page.url.pathname}/leaderboard" color="alternative">
							<span>View Leaderboard</span>
						</Button>
					</div>
				{:else if teamEvent && teams.length > 0}
					<EventTeamLeaderboard {running} {event} teams={teams.slice(0, memberLimit)} />
					<div class="flex flex-row justify-center gap-2">
						<Button href="{page.url.pathname}/leaderboard" color="alternative">
							<span>View Leaderboard</span>
						</Button>
					</div>
				{:else}
					<p class="my-16 max-w-lg text-center">
						This Event does not have any members signed up right now! Login to be the first!
					</p>
				{/if}
			</div>
		</section>
	</div>

	<div class="flex max-w-xl flex-col gap-4" id="agreement">
		<h2 class="text-3xl">Event Agreement</h2>
		<p>
			All members of the event are expected to follow all of <a
				href="https://hypixel.net/rules"
				class="text-blue-500 underline">Hypixel's Server Rules.</a
			> Futhermore, all prizes specified are the responsibility of the Discord Server/Event Sponsor to payout. This
			website is not responsible for unpaid prizes. Please do get in contact however and we'll revoke event permissions
			from the responsible server if appropriate. This website does not take a cut of any prizes or act as a middleman.
		</p>
	</div>
</main>
