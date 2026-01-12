<script lang="ts">
	import { page } from '$app/state';
	import EventLeaderboard from '$comp/events/event-leaderboard.svelte';
	import EventTeamLeaderboard from '$comp/events/event-team-leaderboard.svelte';
	import Linebreaks from '$comp/events/linebreaks.svelte';
	import Head from '$comp/head.svelte';
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { Button } from '$ui/button';
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import User from '@lucide/svelte/icons/user';
	import Users from '@lucide/svelte/icons/users';
	import type { PageData } from './$types';

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

	let highlightUuid = $derived(page.url.hash.slice(1));
	let highlightTeam = $derived(
		teams?.find((team) => team.members?.some((member) => member.playerUuid === highlightUuid))?.id?.toString() ??
			undefined
	);

	let started = $derived(+(event.startTime ?? 0) * 1000 < Date.now());
	let running = $derived(started && +(event.endTime ?? 0) * 1000 > Date.now());
	let joinable = $derived(+(event.joinUntilTime ?? 0) * 1000 > Date.now());

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
		`View the leaderboard for ${running ? 'the Event happening' : 'a past Event'} in ${
			data.guild?.name
		}!\n\n${topList}`
	);

	const favorites = getFavoritesContext();
	const crumbs = $derived<Crumb[]>([
		{
			name: 'Events',
			href: '/browse',
		},
		{
			name: event.name,
			href: `/event/${event.name.replaceAll(' ', '-') + '-' + event.id}`,
		},
		{
			name: 'Leaderboard',
		},
	]);

	const breadcrumb = getPageCtx();
	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);

		favorites.setPage({
			icon: data.guild?.icon?.url ?? undefined,
			name: (data.event.name ?? 'Event') + ' Leaderboard',
			href: page.url.pathname,
		});
	});
</script>

<Head
	title={(event.name || 'Farming Weight Event') + ' Leaderboard'}
	{description}
	imageUrl={guild?.icon?.url}
	canonicalPath="/event/{encodeURIComponent(event.name.replaceAll(' ', '-'))}-{event.id}/leaderboard"
/>

<div class="mb-16 flex flex-col items-center justify-center gap-8" data-sveltekit-preload-data="tap">
	<section class="bg-card mt-16 flex w-full max-w-4xl flex-col items-center gap-4 rounded-md border-2 p-8">
		<h2 class="text-center text-2xl md:text-4xl">{event.name}</h2>
		<p class="text-center md:text-lg"><Linebreaks text={event.description ?? ''} /></p>
		<div class="mt-4 flex w-full max-w-2xl flex-row flex-wrap items-center justify-center gap-2 sm:flex-nowrap">
			<Button
				href="/server/{guild?.id}/join"
				color="blue"
				size="sm"
				class="order-1 flex-1 basis-64"
				variant="secondary"
			>
				<p class="mr-2">Join Discord</p>
				<ExternalLink size={16} />
			</Button>
			{#if joinable}
				<Button
					href="/event/{page.params.event}/membership"
					color="green"
					size="sm"
					class="order-3 flex-1 basis-64"
				>
					Join Event
				</Button>
			{/if}
			<Button
				href="/event/{page.params.event}"
				color="alternative"
				size="sm"
				class="order-2 flex-1 basis-64 sm:order-4"
				variant="secondary"
			>
				Back to Event Page
			</Button>
		</div>
	</section>
	<div class="flex w-full max-w-5xl flex-col gap-8 lg:flex-row">
		<section class="bg-card flex w-full flex-col items-center gap-4 rounded-md border-2 p-8">
			<div class="flex w-full flex-row items-center justify-center gap-8">
				{#if teamEvent}
					<Button onclick={swapLeaderboard} variant="outline" size="sm">
						<ArrowLeftRight size={20} />
						<span class="sr-only">Swap Leaderboard</span>
					</Button>
				{/if}
				{#if !teamEvent || (teamEvent && swapMode)}
					<h2 class="text-2xl">Members</h2>
					<div class="flex flex-row items-center gap-2 font-semibold">
						<p class="text-2xl">
							{members.length?.toLocaleString()}
						</p>
						<User />
					</div>
				{:else}
					<h2 class="text-2xl">Teams</h2>
					<div class="flex flex-row items-center gap-2 font-semibold">
						<p class="text-2xl">
							{teams.length?.toLocaleString()}
						</p>
						<Users />
					</div>
				{/if}
			</div>
			<div class="flex w-full max-w-7xl flex-wrap gap-4 md:mx-32">
				{#if (!teamEvent || swapMode) && members.length > 0}
					<EventLeaderboard {highlightUuid} {running} {event} {members} />
				{:else if teams.length > 0}
					<EventTeamLeaderboard {highlightUuid} {highlightTeam} {started} {running} {event} {teams} />
				{:else}
					<p class="my-16 max-w-lg text-center">
						This Event does not have any members signed up right now! Login to be the first!
					</p>
				{/if}
			</div>
		</section>
	</div>
</div>
