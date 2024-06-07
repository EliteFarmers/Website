<script lang="ts">
	import Head from '$comp/head.svelte';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import type { PageData } from './$types';
	import Leaderboard from './leaderboard.svelte';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Event from '$comp/stats/discord/event.svelte';
	import Guildicon from '$comp/stats/discord/guildicon.svelte';

	export let data: PageData;

	$: guild = data.guild ?? {};
	$: jacob = guild?.features?.jacobLeaderboard;
	$: leaderboards = jacob?.leaderboards ?? [];
</script>

<Head
	title={guild.name ?? 'Server'}
	description={`View all features and events happening in the Discord server: "${guild.name ?? 'Unknown'}"!`}
	imageUrl={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild?.icon}.webp` : undefined}
/>

<main class="flex flex-col justify-center items-center gap-8 mb-16">
	<!-- Banner image -->
	{#if guild?.banner}
		<div
			class="relative flex flex-col items-center justify-center w-full h-64 bg-center bg-cover bg-no-repeat"
			style="background-image: url('https://cdn.discordapp.com/splashes/{guild.id}/{guild?.banner}.png?size=1280')"
		>
			<div class="flex flex-row p-4 items-center bg-zinc-900/75 gap-4 my-32 rounded-lg">
				<Guildicon {guild} size={16} />
				<h1 class="text-4xl text-white">
					{guild?.name}
				</h1>
				<Button href="https://discord.gg/{guild.inviteCode}" variant="link">
					<ExternalLink size={20} class="text-white" />
				</Button>
			</div>
		</div>
	{:else}
		<div class="flex flex-row items-center gap-4 my-16">
			<Guildicon {guild} size={16} />
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

	{#if data.events.length > 0}
		{@const now = Date.now() / 1000}
		{@const upcoming = data.events.filter((e) => e.endTime && +e.endTime >= now)}
		{@const past = data.events
			.filter((e) => e.endTime && +e.endTime < now)
			.sort((a, b) => +(b.endTime ?? 0) - +(a.endTime ?? 0))}

		<section class="flex flex-col gap-4 items-center max-w-5xl w-full">
			<h2 class="text-3xl my-4">Server Events</h2>
			{#if upcoming.length > 0}
				<div class="flex flex-col md:mx-32 gap-4 w-full">
					{#each upcoming as event}
						<Event {event} {guild} />
					{/each}
				</div>
			{:else}
				<p class="max-w-xl text-center my-2">This server does not have any upcoming events right now!</p>
			{/if}

			{#if past.length > 0}
				<Accordion.Root>
					<Accordion.Item value="val" class="w-full">
						<Accordion.Trigger>
							<h2 class="text-3xl text-black dark:text-white w-full px-4">Past Events</h2>
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
	<section class="flex flex-col gap-4 items-center">
		<!-- <h2 class="text-3xl">Server Jacob Leaderboard{leaderboards.length === 1 ? '' : 's'}</h2> -->
		{#if leaderboards.length > 0}
			<div class="flex flex-wrap md:mx-32 max-w-7xl gap-4">
				{#each leaderboards as leaderboard}
					<Leaderboard {leaderboard} />
				{/each}
			</div>
		{:else}
			<p class="max-w-xl text-center my-16">
				This server does not have any Jacob Leaderboards setup right now! Ask the server admins to create one!
			</p>
		{/if}
	</section>

	<div class="mt-8 flex flex-col max-w-xl gap-4 text-center">
		<p class="mt-8">
			Join the Discord server in order to submit entries! There may be requirements to participate, so make sure
			to read the server's information!
		</p>
		<p>
			<strong>What is this?</strong> Server Jacob Leaderboards are a way to track the highest Jacob contests of a server's
			members. It's a fun way to compete with your friends and see who's the best! Access is currently invite only.
		</p>
	</div>
</main>
