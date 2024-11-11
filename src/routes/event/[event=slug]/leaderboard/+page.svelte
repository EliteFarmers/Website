<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import type { PageData } from './$types';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import ArrowLeftRight from 'lucide-svelte/icons/arrow-left-right';
	import Users from 'lucide-svelte/icons/users';
	import User from 'lucide-svelte/icons/user';
	import { page } from '$app/stores';
	import Linebreaks from '$comp/events/linebreaks.svelte';
	import EventTeamLeaderboard from '$comp/events/event-team-leaderboard.svelte';
	import EventLeaderboard from '$comp/events/event-leaderboard.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let event = $derived(data.event ?? {});
	let guild = $derived(data.guild);
	let members = $derived(data.members ?? []);
	let teams = $derived(data.teams ?? []);
	let teamEvent = $derived(teams.length > 0);

	let swapMode = $state(false);

	function swapLeaderboard() {
		swapMode = !swapMode;
	}

	let highlightUuid = $derived($page.url.hash.slice(1));
	let highlightTeam =
		$derived(teams?.find((team) => team.members?.some((member) => member.playerUuid === highlightUuid))?.id?.toString() ??
		undefined);

	let running = $derived(+(event.startTime ?? 0) * 1000 < Date.now() && +(event.endTime ?? 0) * 1000 > Date.now());
	let joinable = $derived(+(event.joinUntilTime ?? 0) * 1000 > Date.now());

	let topList = $derived(teamEvent
		? teams
				.slice(0, 5)
				.map((team, i) => `${i + 1}. ${team.name} • ${(+(team?.score ?? 0)).toLocaleString()}`)
				.join('\n')
		: members
				.slice(0, 5)
				.map((member, i) => `${i + 1}. ${member.playerName} • ${(+(member?.score ?? 0)).toLocaleString()}`)
				.join('\n'));

	let description = $derived(`View the leaderboard for ${running ? 'the Event happening' : 'a past Event'} in ${
		data.guild?.name
	}!\n\n${topList}`);
</script>

<Head title={(event.name || 'Farming Weight Event') + ' Leaderboard'} {description} imageUrl={guild?.icon?.url} />

<main class="flex flex-col justify-center items-center gap-8 mb-16" data-sveltekit-preload-data="tap">
	<section class="flex flex-col gap-4 max-w-4xl bg-primary-foreground rounded-md p-8 mt-16 w-full items-center">
		<h2 class="text-2xl md:text-4xl text-center">{event.name}</h2>
		<p class="md:text-lg text-center"><Linebreaks text={event.description ?? ''} /></p>
		<div class="flex flex-row justify-center gap-2 mt-4 max-w-2xl w-full items-center">
			<Button href="/server/{guild?.id}/join" color="blue" size="sm" class="flex-1">
				<p class="mr-2">Join Discord</p>
				<ExternalLink size={16} />
			</Button>
			{#if joinable}
				<Button href="/event/{$page.params.event}/membership" color="green" size="sm" class="flex-1">
					Join Event
				</Button>
			{/if}
			<Button href="/event/{$page.params.event}" color="alternative" size="sm" class="flex-1">
				Back to Event Page
			</Button>
		</div>
	</section>
	<div class="flex flex-col lg:flex-row gap-8 max-w-5xl w-full">
		<section class="flex flex-col gap-4 w-full items-center bg-primary-foreground rounded-md p-8">
			<div class="flex flex-row gap-8 items-center justify-center w-full">
				{#if teamEvent}
					<Button onclick={swapLeaderboard} variant="secondary" size="sm">
						<ArrowLeftRight size={20} />
						<span class="sr-only">Swap Leaderboard</span>
					</Button>
				{/if}
				{#if !teamEvent || (teamEvent && swapMode)}
					<h2 class="text-2xl">Members</h2>
					<div class="flex flex-row gap-2 font-semibold items-center">
						<p class="text-2xl">
							{members.length?.toLocaleString()}
						</p>
						<User />
					</div>
				{:else}
					<h2 class="text-2xl">Teams</h2>
					<div class="flex flex-row gap-2 font-semibold items-center">
						<p class="text-2xl">
							{teams.length?.toLocaleString()}
						</p>
						<Users />
					</div>
				{/if}
			</div>
			<div class="flex flex-wrap md:mx-32 max-w-7xl gap-4 w-full">
				{#if (!teamEvent || swapMode) && members.length > 0}
					<EventLeaderboard {highlightUuid} {running} {event} {members} />
				{:else if teams.length > 0}
					<EventTeamLeaderboard {highlightUuid} {highlightTeam} {running} {event} {teams} />
				{:else}
					<p class="max-w-lg text-center my-16">
						This Event does not have any members signed up right now! Login to be the first!
					</p>
				{/if}
			</div>
		</section>
	</div>
</main>
