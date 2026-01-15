<script lang="ts">
	import { page } from '$app/state';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import EventData from '$comp/events/event-data.svelte';
	import EventLeaderboard from '$comp/events/event-leaderboard.svelte';
	import EventTeamLeaderboard from '$comp/events/event-team-leaderboard.svelte';
	import EventType from '$comp/events/event-type.svelte';
	import ExternalLinkButton from '$comp/external-link-button.svelte';
	import Head from '$comp/head.svelte';
	import HeroBanner from '$comp/hero-banner.svelte';
	import RenderMd from '$comp/markdown/render-md.svelte';
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import User from '@lucide/svelte/icons/user';
	import Users from '@lucide/svelte/icons/users';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Countdown from './countdown.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { event = {} as typeof data.event, members, teams = [], joined, self, guild } = $derived(data);

	let banner = $derived(event.banner?.url ?? guild?.banner?.url);
	let time = $state(Date.now());
	let start = $derived(+(event.startTime ?? 0) * 1000);
	let end = $derived(+(event.endTime ?? 0) * 1000);
	let joinEnds = $derived(+(event.joinUntilTime ?? 0) * 1000);
	let started = $derived(start < time);
	let running = $derived(start < time && end > time);
	let target = $derived.by(() => (start > time ? start - time : end - time));
	let joinable = $derived(+(event.joinUntilTime ?? 0) * 1000 > Date.now() && !self?.disqualified);
	let teamEvent = $derived((teams?.length ?? 0) > 0);

	let memberLimit = 10;
	let swapMode = $state(false);
	let interval: NodeJS.Timeout | undefined;

	onMount(() => {
		interval = setInterval(() => {
			time = Date.now();
		}, 500);

		return () => stopInterval();
	});

	function visibilityChange() {
		if (document.hidden) {
			time = Date.now();
			stopInterval();
		} else {
			interval = setInterval(() => {
				time = Date.now();
			}, 500);
		}
	}

	function stopInterval() {
		if (interval) {
			clearInterval(interval);
			interval = undefined;
		}
	}

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
		`View the ${running ? 'Event happening' : 'Event'} in ${data.guild?.name}!\n\n${topList}`
	);

	const crumbs = $derived<Crumb[]>([
		{
			name: 'Events',
			href: '/browse',
		},
		{
			name: event.name,
		},
	]);

	const breadcrumb = getPageCtx();
	const favorites = getFavoritesContext();

	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
		favorites.setPage({
			icon: data.guild?.icon?.url ?? undefined,
			name: data.event.name ?? 'Event',
			href: page.url.pathname,
		});
	});
</script>

<svelte:document onvisibilitychange={visibilityChange} />

<Head
	title={event.name || 'Farming Weight Event'}
	{description}
	imageUrl={data.guild?.icon?.url}
	canonicalPath="/event/{encodeURIComponent(event.name.replaceAll(' ', '-'))}-{event.id}"
/>

<HeroBanner src={banner} class="h-64">
	<div class="flex flex-row items-center justify-center gap-4 rounded-lg bg-zinc-900/75 p-4">
		<GuildIcon guild={data.guild} size={16} />
		<h1 class="xs:text-2xl mx-8 text-xl text-white sm:text-3xl md:text-4xl">
			<RenderMd content={data.event?.name} />
		</h1>
		<Button href="/server/{event.guildId}/join" variant="link">
			<ExternalLink size={16} class="text-white" />
		</Button>
	</div>
</HeroBanner>

<div class="mt-64 flex flex-col items-center justify-center gap-8 pt-8" data-sveltekit-preload-data="tap">
	<div class="bg-card relative flex w-full flex-col items-center rounded-md border-2 p-4 md:w-fit">
		{#if end < time}
			<p class="md:text-lg">Event Ended!</p>
		{:else}
			<p class="bg-card absolute top-2 mb-2 rounded-md p-1 pt-0 font-mono md:text-lg">
				{#if start > time}
					Event Starts In
				{:else}
					Event Ends In
				{/if}
			</p>
			<Countdown ms={target} />
		{/if}
	</div>
	<div class="mx-4 flex w-full max-w-6xl flex-col items-center gap-8 lg:flex-row lg:items-start">
		<section class="bg-card flex max-w-md flex-1 basis-1 flex-col justify-between gap-4 rounded-md border-2 p-8">
			<div class="flex flex-row items-center gap-2">
				<h2 class="text-3xl">{event.name}</h2>
				{#if data.session?.perms.admin}
					<Button href="/guild/{event.guildId}/event/{event.id}" variant="outline" size="sm" class="ml-auto">
						Edit
					</Button>
				{/if}
			</div>
			<div class="flex flex-col gap-4">
				<EventType type={event.type ?? 1} />
				<div class="flex flex-col items-start gap-2 text-sm font-semibold md:text-lg">
					<p>
						<span class="text-muted-foreground">Starts</span>
						{new Date(start).toLocaleDateString()}
						{new Date(start).toLocaleTimeString(undefined, {
							hour: 'numeric',
							minute: '2-digit',
						})}
					</p>
					<p>
						<span class="text-muted-foreground">Ends</span>
						{new Date(end).toLocaleDateString()}
						{new Date(end).toLocaleTimeString(undefined, {
							hour: 'numeric',
							minute: '2-digit',
						})}
					</p>
				</div>
				<RenderMd content={event.description ?? ''} />
				{#if event.prizeInfo}
					<p><strong>Prizes</strong></p>
					<RenderMd content={event.prizeInfo ?? ''} />
				{/if}
				<p><strong>Rules</strong></p>
				{#if event.rules}
					<RenderMd content={event.rules ?? ''} />
				{/if}
				<EventData {event} />
				<a href="#agreement" class="text-link underline">Event Agreement</a>
				<p>
					{#if joinable}
						<span class="text-muted-foreground">Joining Closes</span>
					{:else}
						<span class="text-muted-foreground">Joining Closed</span>
					{/if}
					{new Date(joinEnds).toLocaleDateString()}
					{new Date(joinEnds).toLocaleTimeString(undefined, {
						hour: 'numeric',
						minute: '2-digit',
					})}
				</p>
				<div class="mt-4 flex flex-wrap justify-center gap-2">
					<Button href="/server/{event.guildId}">
						<p>Back To Server</p>
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
				{#if joinable && !joined}
					<div class="text-muted-foreground flex flex-row items-center justify-center gap-1 text-sm">
						<CircleAlert class="size-4" />
						<span
							>You must be in the <a href="#host" class="underline">host Discord server</a> to join!</span
						>
					</div>
				{/if}
				{#if self?.disqualified}
					<div class="flex flex-col justify-start gap-1 text-sm">
						<p class="text-destructive text-lg">You have been removed from this event.</p>
						<p>Reason</p>
						<p class="bg-card rounded-sm p-2">{self.notes ?? 'Unknown - Ask Server Staff'}</p>
					</div>
				{/if}
			</div>
		</section>
		<section class="bg-card flex w-full flex-1 basis-1 flex-col items-center gap-4 rounded-md border-2 p-8">
			<div class="flex w-full flex-row items-center justify-center gap-8">
				{#if teamEvent}
					<Button onclick={swapLeaderboard} variant="outline" size="sm">
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
					<EventTeamLeaderboard {running} {started} {event} teams={teams.slice(0, memberLimit)} />
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

	<section class="flex w-full max-w-4xl scroll-mt-64 flex-col gap-4" id="host">
		<div class="bg-card flex flex-col items-center justify-between gap-2 rounded-md border-2 p-4 md:flex-row">
			<div class="flex flex-1 flex-col gap-2">
				<span class="text-muted-foreground italic">This event is hosted by...</span>
				<div class="flex flex-row items-center gap-2">
					<GuildIcon guild={data.guild} size={12} />
					<h3 class="text-2xl font-semibold">{data.guild?.name}</h3>
				</div>
			</div>
			<div class="flex flex-1 flex-row items-center gap-4 md:flex-col md:items-end md:gap-2">
				<div class="hidden flex-row items-center gap-2 font-semibold sm:flex">
					<p class="text-lg md:text-xl">
						{data.guild?.memberCount?.toLocaleString()}
					</p>
					<Users />
				</div>
				<Button href="/server/{event.guildId}/join">
					<p class="mr-2">Join Discord Server</p>
					<ExternalLink size={16} />
				</Button>
			</div>
		</div>
	</section>

	<section class="flex max-w-xl scroll-mt-64 flex-col gap-4" id="agreement">
		<h3 class="text-2xl">Event Agreement</h3>
		<p>
			All members of the event are expected to follow all of <a
				href="https://hypixel.net/rules"
				class="text-link underline">Hypixel's Server Rules.</a
			> Futhermore, all prizes specified are the responsibility of the Discord Server/Event Sponsor to payout. This
			website is not responsible for unpaid prizes. Please do get in contact however and we'll revoke event permissions
			from the responsible server if appropriate. This website does not take a cut of any prizes or act as a middleman.
		</p>
	</section>

	<section class="bg-card flex w-full max-w-4xl flex-col items-start gap-4 rounded-md border-2 p-8" id="faq">
		<h3 class="text-2xl">Frequently Asked Questions</h3>
		<Accordion.Root type="multiple" class="w-full">
			<Accordion.Item value="item-1">
				<Accordion.Trigger><p class="text-left">How is progress counted?</p></Accordion.Trigger>
				<Accordion.Content>
					When you first join an event, your initial stats relevant to the event are recorded. After that,
					whenever your stats change your score is updated while the event is still running. Make sure you've
					joined before starting to grind!
					<br /><br />
					Beyond that, different event types have different logic for how they calculate your score. Farming Weight
					events aren't affected by minions or pest kills, as they verify your collections with tool counters.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="item-2">
				<Accordion.Trigger
					><p class="text-left">Do my stats get fetched from Hypixel automatically?</p></Accordion.Trigger
				>
				<Accordion.Content>
					No. This would potentially be a violation of <ExternalLinkButton
						href="https://developer.hypixel.net/policies/">Hypixel's API policies</ExternalLinkButton
					>. Someone has to manually load your stats page for changes to be detected. Due to the popularity of
					events, this is usually done frequently by users and doesn't cause issues.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="item-3">
				<Accordion.Trigger><p class="text-left">What happens if I get disqualified?</p></Accordion.Trigger>
				<Accordion.Content>
					If you are disqualified from an event, you will be removed from the event and recieve a
					disqualification reason in place of the "Join"/"My Membership" button. You will not be able to
					rejoin the event. You might be able to appeal your disqualification by contacting the <strong
						>staff of the Discord server this event takes place in</strong
					>.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="item-4">
				<Accordion.Trigger><p class="text-left">Can I rejoin if I leave the event?</p></Accordion.Trigger>
				<Accordion.Content>
					Yes, as long as the event is still running, joining hasn't closed, and you haven't been
					disqualified.
					<br /><br />
					Your score <strong>will not</strong> be reset if you rejoin, but keep in mind that you can't rejoin once
					it closes!
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="item-5">
				<Accordion.Trigger><p class="text-left">What if I suspect someone is cheating?</p></Accordion.Trigger>
				<Accordion.Content>
					If you suspect someone is cheating, you can report them to the <strong
						>staff of the Discord server this event takes place in</strong
					>. If they are found to be cheating, they will be disqualified from the event.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="item-6">
				<Accordion.Trigger
					><p class="text-left">
						What if my stats are still on cooldown when the event ends?
					</p></Accordion.Trigger
				>
				<Accordion.Content>
					Unfortunately, there's nothing you can do. If you are still on cooldown when the event ends, your
					score will be locked in at the last time your data was fetched. This scenario could lead to you
					losing out on a few minutes of progress, but generally these events last long enough that a few
					minutes of progress won't matter.
					<br /><br />
					This scenario also can happen at the start of the event. If you joined before the event started, your
					initial stats only get loaded the next time your stats are fetched once the event is running. This means
					that you may need to wait for your second fetch to see your score increase.
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
		<h4 class="mt-4 -mb-2 text-xl">Team Events</h4>
		<Accordion.Root type="multiple" class="w-full">
			<Accordion.Item value="item-1">
				<Accordion.Trigger><p class="text-left">How do I join/leave a team?</p></Accordion.Trigger>
				<Accordion.Content>
					You can join a team by clicking the "Join Event"/"Manage Membership" button on the event page. If
					you are already in a team, you can leave it and join another one at any time.
					<br /><br />
					To join a team, you may need a <strong>join code</strong>. This is a string of characters that the
					team leader can generate in their Manage Membership page. Ask the leader of the team you want to
					join for this code!
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="item-2">
				<Accordion.Trigger
					><p class="text-left">Do I need to be in the same co-op with my team?</p></Accordion.Trigger
				>
				<Accordion.Content>
					You might be wondering if you and your team need to share the same Skyblock Co-op, and the answer is
					<strong>no!</strong> You can be in different co-ops and still be on the same team. You can be in the same
					co-op if you want to, but it does not matter for the event.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="item-3">
				<Accordion.Trigger
					><p class="text-left">Will my score transfer to a new team if I move?</p></Accordion.Trigger
				>
				<Accordion.Content>
					Yes! Your score will transfer to the new team if you leave and rejoin. You can also leave and rejoin
					the same team as long as you have the join code.
					<br /><br />
					However, <strong>you will be locked into the team you are in when the joining period ends.</strong> You
					will not be able to leave or rejoin a team after this point.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="item-4">
				<Accordion.Trigger><p class="text-left">How do I make/manage a team?</p></Accordion.Trigger>
				<Accordion.Content>
					If the event allows it, you can create a team by clicking the "Join Event"/"Manage Membership"
					button on the event page. Once you are in the event, you can create a team by clicking the "Create
					Team" button. You can change your team name and copy your join code here! Other players can join
					your team by entering this code in the "Join Team" section of the event page.
					<br /><br />
					Here you're also able to kick members from your team, and change the join code. (If you kick someone,
					they will be able to rejoin with the same code unless you change it!) Your team mates are trusting you
					not to kick them out last minute, so please don't do that!
					<br /><br />
					<strong
						>Once the joining period ends, you will not be able to kick members from your team. You will
						also not be able to leave the team you are in.</strong
					>
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="item-5">
				<Accordion.Trigger><p class="text-left">How do I leave a team?</p></Accordion.Trigger>
				<Accordion.Content>
					As long as the joining period hasn't closed, you can leave your team by clicking the leave button on
					the Manage Membership page.
					<br /><br />
					You might not be able to rejoin the same team if you leave it, the team leader might have changed the
					join code!
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="item-6">
				<Accordion.Trigger
					><p class="text-left">What if I suspect someone is cheating on my team?</p></Accordion.Trigger
				>
				<Accordion.Content>
					If you're the team leader and you suspect someone is cheating on your team while the joining period
					is open, you can kick them from the team by clicking the kick button found on the Manage Membership
					page.
					<br /><br />
					You can also can also report them to the
					<strong>staff of the Discord server this event takes place in</strong>. If they are found to be
					cheating, they will be disqualified from the event. The team can continue to play, but they will be
					unfortunately down a member.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="item-7">
				<Accordion.Trigger><p class="text-left">Can I play solo?</p></Accordion.Trigger>
				<Accordion.Content>
					You can play solo by creating a team with yourself as the only member, but you will be at a serious
					disadvantage compared to other teams.
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</section>
</div>
