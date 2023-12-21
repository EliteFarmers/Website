<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Input } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import Head from '$comp/head.svelte';
	import { ArrowUpRightFromSquareOutline } from 'flowbite-svelte-icons';

	export let data: PageData;
	$: features = data.guild?.features;
</script>

<Head title="Server Settings" description="Manage server settings for your guild!" />

<main class="flex flex-col items-center gap-8">
	<div class="flex flex-row items-center gap-4">
		<img
			class="w-16 h-16"
			src="https://cdn.discordapp.com/icons/{data.guildId}/{data.guild?.icon}.webp"
			alt="Guild Icon"
		/>
		<h1 class="text-4xl my-16">
			{data.guild?.name}
		</h1>
	</div>

	<div class="flex flex-row gap-4 items-middle">
		<h2 class="text-lg">View Public Page</h2>
		<Button size="sm" href="/server/{data.guildId}" color="blue">
			<ArrowUpRightFromSquareOutline size="sm" />
		</Button>
	</div>

	<section class="flex flex-wrap gap-8 text-center align-middle justify-center">
		<Card color="none" border={false} class="bg-gray-100 dark:bg-zinc-800">
			<form
				method="POST"
				action="?/setInvite"
				class="flex flex-col gap-4 w-full justify-center items-center"
				use:enhance
			>
				<h2 class="text-2xl">Server Invite</h2>
				{#if data.guild?.inviteCode}
					<div class="flex flex-row gap-2 items-center">
						<p>Current: <strong>{data.guild.inviteCode}</strong></p>
						<Button size="xs" href="https://discord.gg/{data.guild.inviteCode}" color="blue">
							<ArrowUpRightFromSquareOutline size="xs" />
						</Button>
					</div>
				{:else}
					<p class="text-red-500">No invite set! This is required for your public page.</p>
				{/if}
				<p>Set the invite code for your server!</p>
				<div class="flex flex-row gap-4">
					<Input let:props name="invite" placeholder="Invite Code">
						<input {...props} maxlength="16" required />
					</Input>

					<Button type="submit">Set</Button>
				</div>
			</form>
		</Card>
		<Card color="none" border={false} class="bg-gray-100 dark:bg-zinc-800 flex flex-col gap-4 justify-between">
			<h2 class="text-2xl">Server Jacob Leaderboards</h2>
			{#if !features?.jacobLeaderboardEnabled}
				<p>
					This server does not have the Jacob Leaderboard feature enabled. For now please ask "kaeso.dev" on
					Discord to gain access to this feature.
				</p>
			{:else}
				<p>Manage your server specific Jacob Leaderboards!</p>
				<Button href="/guild/{data.guildId}/jacob">Manage</Button>
			{/if}
		</Card>
		<Card color="none" border={false} class="bg-gray-100 dark:bg-zinc-800 flex flex-col gap-4 justify-between">
			<h2 class="text-2xl">Server Events</h2>
			{#if !features?.eventsEnabled}
				<p>
					This server does not have the Event feature enabled. For now please ask "kaeso.dev" on Discord to
					gain access to this feature.
				</p>
			{:else}
				<p>Create or manage your Events!</p>
				<Button href="/guild/{data.guildId}/events">Manage</Button>
			{/if}
		</Card>
		<Card color="none" border={false} class="bg-gray-100 dark:bg-zinc-800 flex flex-col gap-4 justify-between">
			<h2 class="text-2xl">Upcoming Contest Pings</h2>
			{#if !features?.contestPingsEnabled}
				<p>
					This server does not have the Upcoming Contest Pings feature enabled. For now please ask "kaeso.dev" on Discord to
					gain access to this feature.
				</p>
			{:else}
				<p>Manage upcoming Jacob Contest pings within your Discord Server!</p>
				<Button href="/guild/{data.guildId}/pings">Manage</Button>
			{/if}
		</Card>
	</section>
</main>
