<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import * as Card from '$ui/card';
	import type { PageData } from './$types';
	import Head from '$comp/head.svelte';
	import Guildicon from '$comp/stats/discord/guildicon.svelte';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	export let data: PageData;
	$: features = data.guild?.features;
</script>

<Head title="Server Settings" description="Manage server settings for your guild!" />

<main class="flex flex-col items-center gap-8">
	<div class="flex flex-row items-center gap-4">
		<Guildicon guild={data.guild} size={16} />
		<h1 class="text-4xl my-16">
			{data.guild?.name}
		</h1>
	</div>

	<div class="flex flex-row gap-4 items-center">
		<h2 class="text-lg">View Public Page</h2>
		<Button href="/server/{data.guildId}" variant="outline">
			<ExternalLink size={16} />
		</Button>
	</div>

	<section class="flex flex-wrap gap-8 text-center align-middle justify-center mb-16 max-w-4xl">
		<Card.Root class="flex-1 basis-64 max-w-md">
			<Card.Header>
				<Card.Title class="text-xl">Server Invite</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2 self-stretch items-center">
				{#if data.guild?.inviteCode}
					<div class="flex flex-row gap-2 items-center">
						<p>Current: <strong>{data.guild.inviteCode}</strong></p>
						<Button size="sm" href="https://discord.gg/{data.guild.inviteCode}" variant="outline">
							<ExternalLink size={16} />
						</Button>
					</div>
				{:else}
					<p class="text-red-500">No invite set! This is required for your public page.</p>
				{/if}
				<p>Set the invite code for your server!</p>
				<form method="POST" action="?/setInvite" class="flex flex-row gap-4" use:enhance>
					<Input name="invite" placeholder="Invite Code" maxlength={16} />
					<Button type="submit">Set</Button>
				</form>
			</Card.Content>
		</Card.Root>
		<Card.Root class="flex-1 basis-64 flex flex-col max-w-md">
			<Card.Header>
				<Card.Title class="text-xl">Server Jacob Leaderboards</Card.Title>
			</Card.Header>
			<Card.Content class="flex-1 flex flex-col gap-2 justify-between self-stretch items-center">
				{#if !features?.jacobLeaderboardEnabled}
					<p>
						This server does not have the Jacob Leaderboard feature enabled. For now please ask "kaeso.dev"
						on Discord to gain access to this feature.
					</p>
				{:else}
					<p>Manage your server specific Jacob Leaderboards!</p>
					<Button href="/guild/{data.guildId}/jacob" class="mt-4 px-8">Manage</Button>
				{/if}
			</Card.Content>
		</Card.Root>
		<Card.Root class="flex-1 basis-64 flex flex-col max-w-md">
			<Card.Header>
				<Card.Title class="text-xl">Server Events</Card.Title>
			</Card.Header>
			<Card.Content class="flex-1 flex flex-col gap-2 justify-between self-stretch items-center">
				{#if !features?.eventsEnabled}
					<p>
						This server does not have the Event feature enabled. For now please ask "kaeso.dev" on Discord
						to gain access to this feature.
					</p>
				{:else}
					<p>Create or manage your Events!</p>
					<Button href="/guild/{data.guildId}/events" class="mt-4 px-8">Manage</Button>
				{/if}
			</Card.Content>
		</Card.Root>
		<Card.Root class="flex-1 basis-64 flex flex-col max-w-md">
			<Card.Header>
				<Card.Title class="text-xl">Upcoming Contest Pings</Card.Title>
			</Card.Header>
			<Card.Content class="flex-1 flex flex-col gap-2 justify-between self-stretch items-center">
				{#if !features?.contestPingsEnabled}
					<p>
						This server does not have the Upcoming Contest Pings feature enabled. For now please ask
						"kaeso.dev" on Discord to gain access to this feature.
					</p>
				{:else}
					<p>Manage upcoming Jacob Contest pings within your Discord Server!</p>
					<Button href="/guild/{data.guildId}/pings" class="mt-4 px-8">Manage</Button>
				{/if}
			</Card.Content>
		</Card.Root>
	</section>
</main>
