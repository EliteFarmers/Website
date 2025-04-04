<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import * as Card from '$ui/card';
	import * as Select from '$ui/select';
	import type { ActionData, PageData } from './$types';
	import Head from '$comp/head.svelte';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { page } from '$app/state';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let features = $derived(data.guild?.features);
	let visibility = $state(data.guild?.public !== true);
	let currentLeaderboardCount = $derived(features?.jacobLeaderboard?.maxLeaderboards ?? 0);
	let currentEventCount = $derived(features?.eventSettings?.maxMonthlyEvents ?? 0);
	let leaderboardCount = $state(3);
	let eventCount = $state(1);

	let roles = $derived(
		(data.guild?.roles ?? [])
			.map((r) => ({
				value: r.id ?? '',
				label: '@' + (r.name ?? ''),
			}))
			.filter((r) => r.value && r.label !== '@@everyone')
	);

	const favorites = getFavoritesContext();
	favorites.setPage({
		icon: data.guild.icon?.url ?? undefined,
		name: data.guild?.name ?? 'Guild Settings',
		href: page.url.pathname,
	});
</script>

<Head title={data.guild?.name ?? 'Guild Settings'} description="Manage server settings for your guild!" />

<div class="flex flex-col items-center gap-8">
	<div class="flex flex-row items-center gap-4">
		<GuildIcon guild={data.guild} size={16} />
		<h1 class="my-16 text-4xl">
			{data.guild?.name}
		</h1>
	</div>

	<div class="flex flex-row items-center gap-4">
		{#if data.guild?.public}
			<h2 class="text-lg">View Public Page</h2>
			<Button href="/server/{data.guildId}" variant="outline">
				<ExternalLink size={16} />
			</Button>
		{:else}
			<p class="text-destructive">Private Guild</p>
		{/if}
	</div>

	{#if form?.error}
		<p class="text-destructive">{form.error}</p>
	{/if}

	<section class="mb-16 flex max-w-4xl flex-wrap justify-center gap-8 text-center align-middle">
		<Card.Root class="max-w-md flex-1 basis-64">
			<Card.Header>
				<Card.Title class="text-xl">Server Invite</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col items-center gap-2 self-stretch">
				{#if data.guild?.inviteCode}
					<div class="flex flex-row items-center gap-2">
						<p>Current: <strong>{data.guild.inviteCode}</strong></p>
						<Button size="sm" href="https://discord.gg/{data.guild.inviteCode}" variant="outline">
							<ExternalLink size={16} />
						</Button>
					</div>
				{:else}
					<p class="text-destructive">No invite set! This is required for your public page.</p>
				{/if}
				<p>Set the invite code for your server!</p>
				<form method="POST" action="?/setInvite" class="flex flex-row gap-4" use:enhance>
					<Input name="invite" placeholder="Invite Code" maxlength={16} />
					<Button type="submit">Set</Button>
				</form>
			</Card.Content>
		</Card.Root>
		<Card.Root class="flex max-w-md flex-1 basis-64 flex-col">
			<Card.Header>
				<Card.Title class="text-xl">Server Jacob Leaderboards</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-1 flex-col items-center justify-between gap-2 self-stretch">
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
		<Card.Root class="flex max-w-md flex-1 basis-64 flex-col">
			<Card.Header>
				<Card.Title class="text-xl">Server Events</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-1 flex-col items-center justify-between gap-2 self-stretch">
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
		<Card.Root class="flex max-w-md flex-1 basis-64 flex-col">
			<Card.Header>
				<Card.Title class="text-xl">Upcoming Contest Pings</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-1 flex-col items-center justify-between gap-2 self-stretch">
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
		<Card.Root class="max-w-md flex-1 basis-64">
			<Card.Header>
				<Card.Title class="text-xl">Admin Role</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col items-center gap-2 self-stretch">
				<div class="flex flex-row items-center gap-2">
					<p>
						Current: <strong
							>{data.guild.adminRole === '0'
								? 'None!'
								: roles.find((r) => r.value === data.guild.adminRole)?.label}</strong
						>
					</p>
				</div>
				<p class="text-destructive">
					Users with this role will have access to all server settings (besides this one)
				</p>
				<form method="POST" action="?/setAdminRole" class="flex w-full flex-row gap-4" use:enhance>
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
		<section class="mb-16 flex max-w-4xl flex-wrap justify-center gap-8 text-center align-middle">
			<Card.Root class="flex max-w-md flex-1 basis-64 flex-col">
				<Card.Header>
					<Card.Title class="text-xl">Set Guild Visibility</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-1 flex-col items-center justify-between gap-2 self-stretch">
					<p>Toggle this guilds public visibility.</p>
					<form
						method="POST"
						action="?/setPublic"
						class="flex flex-row items-center justify-center gap-4"
						use:enhance
					>
						<input type="hidden" bind:value={visibility} name="visibility" />
						<Button type="submit" class="mt-4 px-8">Toggle</Button>
					</form>
				</Card.Content>
			</Card.Root>
			<Card.Root class="flex max-w-md flex-1 basis-64 flex-col">
				<Card.Header>
					<Card.Title class="text-xl">Enable Jacob Leaderboards</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-1 flex-col items-center justify-between gap-2 self-stretch">
					<p>Current Max Leaderboards: <strong>{currentLeaderboardCount}</strong></p>
					<form
						method="POST"
						action="?/updateJacob"
						class="mt-4 flex flex-row items-center justify-center gap-4"
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
			<Card.Root class="flex max-w-md flex-1 basis-64 flex-col">
				<Card.Header>
					<Card.Title class="text-xl">Enable Events</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-1 flex-col items-center justify-between gap-2 self-stretch">
					<p>Current Max Events: <strong>{currentEventCount}</strong></p>
					<form
						method="POST"
						action="?/updateEvents"
						class="mt-4 flex flex-row items-center justify-center gap-4"
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
</div>
