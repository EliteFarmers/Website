<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import * as Card from '$ui/card';
	import * as Select from '$ui/select';
	import type { ActionData, PageData } from './$types';
	import Head from '$comp/head.svelte';
	import GuildIcon from '$comp/stats/discord/guild-icon.svelte';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	export let data: PageData;
	export let form: ActionData;

	$: features = data.guild?.features;
	$: visibility = data.guild?.public !== true;
	$: currentLeaderboardCount = features?.jacobLeaderboard?.maxLeaderboards ?? 0;
	$: currentEventCount = features?.eventSettings?.maxMonthlyEvents ?? 0;
	let leaderboardCount = 3;
	let eventCount = 1;

	$: roles = (data.guild?.roles ?? [])
		.map((r) => ({
			value: r.id ?? '',
			label: '@' + (r.name ?? ''),
		}))
		.filter((r) => r.value && r.label !== '@@everyone');
</script>

<Head title="Server Settings" description="Manage server settings for your guild!" />

<main class="flex flex-col items-center gap-8">
	<div class="flex flex-row items-center gap-4">
		<GuildIcon guild={data.guild} size={16} />
		<h1 class="text-4xl my-16">
			{data.guild?.name}
		</h1>
	</div>

	<div class="flex flex-row gap-4 items-center">
		{#if data.guild?.public}
			<h2 class="text-lg">View Public Page</h2>
			<Button href="/server/{data.guildId}" variant="outline">
				<ExternalLink size={16} />
			</Button>
		{:else}
			<p class="text-red-500">Private Guild</p>
		{/if}
	</div>

	{#if form?.error}
		<p class="text-red-500">{form.error}</p>
	{/if}

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
		<Card.Root class="flex-1 basis-64 max-w-md">
			<Card.Header>
				<Card.Title class="text-xl">Admin Role</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2 self-stretch items-center">
				<div class="flex flex-row gap-2 items-center">
					<p>
						Current: <strong
							>{data.guild.adminRole === '0'
								? 'None!'
								: roles.find((r) => r.value === data.guild.adminRole)?.label}</strong
						>
					</p>
				</div>
				<p class="text-red-600">
					Users with this role will have access to all server settings (besides this one)
				</p>
				<form method="POST" action="?/setAdminRole" class="flex flex-row gap-4 w-full" use:enhance>
					<Select.Simple
						options={roles}
						value={data.guild.adminRole === '0' ? undefined : data.guild.adminRole}
						placeholder="Select a role"
						name="role"
					/>
					<Button type="submit">Set</Button>
				</form>
			</Card.Content>
		</Card.Root>
	</section>
	{#if data.session?.flags.admin}
		<section class="flex flex-wrap gap-8 text-center align-middle justify-center mb-16 max-w-4xl">
			<Card.Root class="flex-1 basis-64 flex flex-col max-w-md">
				<Card.Header>
					<Card.Title class="text-xl">Set Guild Visibility</Card.Title>
				</Card.Header>
				<Card.Content class="flex-1 flex flex-col gap-2 justify-between self-stretch items-center">
					<p>Toggle this guilds public visibility.</p>
					<form
						method="POST"
						action="?/setPublic"
						class="flex flex-row gap-4 items-center justify-center"
						use:enhance
					>
						<input type="hidden" bind:value={visibility} name="visibility" />
						<Button type="submit" class="mt-4 px-8">Toggle</Button>
					</form>
				</Card.Content>
			</Card.Root>
			<Card.Root class="flex-1 basis-64 flex flex-col max-w-md">
				<Card.Header>
					<Card.Title class="text-xl">Enable Jacob Leaderboards</Card.Title>
				</Card.Header>
				<Card.Content class="flex-1 flex flex-col gap-2 justify-between self-stretch items-center">
					<p>Current Max Leaderboards: <strong>{currentLeaderboardCount}</strong></p>
					<form
						method="POST"
						action="?/updateJacob"
						class="flex flex-row gap-4 items-center justify-center mt-4"
						use:enhance
					>
						<Input
							name="max"
							placeholder="Max Leaderboards"
							maxlength={2}
							type="number"
							bind:value={leaderboardCount}
							required
						/>
						{#if features?.jacobLeaderboardEnabled}
							<input type="hidden" value={false} name="enable" />
							<Button type="submit" class="px-8">Disable</Button>
						{:else}
							<input type="hidden" value={true} name="enable" />
							<Button type="submit" class="px-8">Enable</Button>
						{/if}
					</form>
				</Card.Content>
			</Card.Root>
			<Card.Root class="flex-1 basis-64 flex flex-col max-w-md">
				<Card.Header>
					<Card.Title class="text-xl">Enable Events</Card.Title>
				</Card.Header>
				<Card.Content class="flex-1 flex flex-col gap-2 justify-between self-stretch items-center">
					<p>Current Max Events: <strong>{currentEventCount}</strong></p>
					<form
						method="POST"
						action="?/updateEvents"
						class="flex flex-row gap-4 items-center justify-center mt-4"
						use:enhance
					>
						<Input
							name="max"
							placeholder="Max Events"
							maxlength={2}
							type="number"
							bind:value={eventCount}
							required
						/>
						{#if features?.eventsEnabled}
							<input type="hidden" value={false} name="enable" />
							<Button type="submit" class="px-8">Disable</Button>
						{:else}
							<input type="hidden" value={true} name="enable" />
							<Button type="submit" class="px-8">Enable</Button>
						{/if}
					</form>
				</Card.Content>
			</Card.Root>
		</section>
	{/if}
</main>
