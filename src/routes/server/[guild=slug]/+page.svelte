<script lang="ts">
	import Head from '$comp/head.svelte';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import type { PageData } from './$types';
	import Leaderboard from './leaderboard.svelte';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Event from '$comp/discord/event.svelte';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';
	import HeroBanner from '$comp/hero-banner.svelte';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { page } from '$app/state';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let guild = $derived(data.guild ?? {});
	let jacob = $derived(guild?.features?.jacobLeaderboard);
	let leaderboards = $derived(jacob?.leaderboards ?? []);

	const crumbs = $derived<Crumb[]>([
		{
			name: 'Servers',
			href: '/browse',
		},
		{
			name: guild.name,
		},
	]);

	const breadcrumb = getBreadcrumb();
	$effect.pre(() => {
		breadcrumb.setOverride(crumbs);
	});

	const favorites = getFavoritesContext();
	favorites.setPage({
		icon: data.guild?.icon?.url ?? undefined,
		name: data.guild.name ?? 'Server',
		href: page.url.pathname,
	});
</script>

<Head
	title={guild.name ?? 'Server'}
	description={`View all features and events happening in the Discord server: "${guild.name ?? 'Unknown'}"!`}
	imageUrl={guild.icon?.url}
/>

<HeroBanner src={guild.banner?.url} class="h-64">
	<!-- Banner image -->
	{#if guild?.banner?.url}
		<div class="my-32 flex flex-row items-center gap-4 rounded-lg bg-zinc-900/75 p-4">
			<GuildIcon {guild} size={16} />
			<h1 class="text-4xl text-white">
				{guild?.name}
			</h1>
			<Button href="https://discord.gg/{guild.inviteCode}" variant="link">
				<ExternalLink size={20} class="text-white" />
			</Button>
		</div>
	{:else}
		<div class="my-16 flex flex-row items-center gap-4">
			<GuildIcon {guild} size={16} />
			<h1 class="text-4xl">
				{guild?.name}
			</h1>
			<Button href="https://discord.gg/{guild.inviteCode}" color="blue">
				<div class="flex flex-row items-center gap-2">
					<ExternalLink size={20} />
				</div>
			</Button>
		</div>
	{/if}
</HeroBanner>

<div class="mb-16 mt-64 flex flex-col items-center justify-center gap-8 py-8">
	{#if data.events.length > 0}
		{@const now = Date.now() / 1000}
		{@const upcoming = data.events.filter((e) => e.endTime && +e.endTime >= now)}
		{@const past = data.events
			.filter((e) => e.endTime && +e.endTime < now)
			.sort((a, b) => +(b.endTime ?? 0) - +(a.endTime ?? 0))}

		<section class="flex w-full max-w-5xl flex-col items-center gap-4">
			<h2 class="my-4 text-3xl">Server Events</h2>
			{#if upcoming.length > 0}
				<div class="flex w-full flex-col gap-4 md:mx-32">
					{#each upcoming as event}
						<Event {event} {guild} />
					{/each}
				</div>
			{:else}
				<p class="my-2 max-w-xl text-center">This server does not have any upcoming events right now!</p>
			{/if}

			{#if past.length > 0}
				<Accordion.Root type="single">
					<Accordion.Item value="val" class="w-full">
						<Accordion.Trigger>
							<h2 class="w-full px-4 text-3xl">Past Events</h2>
						</Accordion.Trigger>
						<Accordion.Content>
							<div class="flex flex-col gap-2">
								{#each past as event}
									<Event {event} {guild} />
								{/each}
							</div>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			{/if}
		</section>
	{/if}

	<!-- Features -->
	<section class="flex flex-col items-center gap-4">
		<!-- <h2 class="text-3xl">Server Jacob Leaderboard{leaderboards.length === 1 ? '' : 's'}</h2> -->
		{#if leaderboards.length > 0}
			<div class="flex max-w-8xl flex-wrap gap-4">
				{#each leaderboards as leaderboard}
					<Leaderboard {leaderboard} />
				{/each}
			</div>
		{:else}
			<p class="my-16 max-w-xl text-center">
				This server does not have any Jacob Leaderboards setup right now! Ask the server admins to create one!
			</p>
		{/if}
	</section>

	<div class="mt-8 flex max-w-xl flex-col gap-4 text-center">
		<p class="mt-8">
			Join the Discord server in order to submit entries! There may be requirements to participate, so make sure
			to read the server's information!
		</p>
		<p>
			<strong>What is this?</strong> Server Jacob Leaderboards are a way to track the highest Jacob contests of a server's
			members. It's a fun way to compete with your friends and see who's the best! Access is currently invite only.
		</p>
	</div>
</div>
