<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import RoleSelect from '$comp/discord/role-select.svelte';
	import ExternalLinkButton from '$comp/external-link-button.svelte';
	import Head from '$comp/head.svelte';
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import SettingSeperator from '$comp/settings/setting-seperator.svelte';
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import { Input } from '$ui/input';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import type { ActionData, PageData } from './$types';

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

	let roles = $derived(data.guild?.roles ?? []);

	const crumbs = $derived<Crumb[]>([
		{
			name: 'Servers',
			href: '/profile/servers',
		},
		{
			name: data.guild.name,
		},
	]);

	const breadcrumb = getBreadcrumb();
	$effect.pre(() => {
		breadcrumb.setOverride(crumbs);
	});

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

	<section class="flex max-w-4xl flex-wrap justify-center gap-8 text-center align-middle">
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
								: roles.find((r) => r.id === data.guild.adminRole)?.name}</strong
						>
					</p>
				</div>
				<p class="text-destructive">
					Users with this role will have access to all server settings (besides this one)
				</p>
				<form method="POST" action="?/setAdminRole" class="flex w-full flex-row gap-4" use:enhance>
					<RoleSelect
						{roles}
						value={data.guild.adminRole === '0' ? undefined : (data.guild.adminRole ?? undefined)}
						placeholder="Select a role"
						name="role"
						triggerClass="flex-1 justify-between"
					/>
					<Button type="submit">Set</Button>
				</form>
			</Card.Content>
		</Card.Root>
	</section>

	<div class="border-completed w-full max-w-4xl rounded-md border-2 p-4">
		<p class="mb-1 text-lg font-semibold">Want to unlock a feature?</p>
		<p class="text-sm">
			Subscribe to the appropriate package in the <ExternalLinkButton href="/support"
				>support server's</ExternalLinkButton
			> built-in Discord Shop and/or open a ticket in the support server to discuss options!
		</p>
	</div>

	<section class="bg-card flex w-full max-w-4xl flex-col rounded-md border-2 p-4">
		<SettingListItem title="Upcoming Contest Pings">
			{#snippet subtitle()}
				{#if !features?.contestPingsEnabled}
					<span class="text-destructive text-sm">This server does not have this feature unlocked.</span>
				{:else}
					<span class="text-muted-foreground text-sm">Manage your server specific contest pings!</span>
				{/if}
			{/snippet}
			{#if features?.contestPingsEnabled}
				<Button href="/guild/{data.guildId}/pings" class="px-8">Manage</Button>
			{:else}
				{@render disabledBtn()}
			{/if}
		</SettingListItem>
		<SettingSeperator />
		<SettingListItem title="Jacob Leaderboards">
			{#snippet subtitle()}
				{#if !features?.jacobLeaderboardEnabled}
					<span class="text-destructive text-sm">This server does not have this feature unlocked.</span>
				{:else}
					<span class="text-muted-foreground text-sm">Manage your server specific jacob leaderboards!</span>
				{/if}
			{/snippet}
			{#if features?.jacobLeaderboardEnabled}
				<Button href="/guild/{data.guildId}/jacob" class="px-8">Manage</Button>
			{:else}
				{@render disabledBtn()}
			{/if}
		</SettingListItem>
		<SettingSeperator />
		<SettingListItem title="Server Events">
			{#snippet subtitle()}
				{#if !features?.eventsEnabled}
					<span class="text-destructive text-sm">This server does not have this feature unlocked.</span>
				{:else}
					<span class="text-muted-foreground text-sm">Manage your server specific events!</span>
				{/if}
			{/snippet}
			{#if features?.eventsEnabled}
				<Button href="/guild/{data.guildId}/events" class="px-8">Manage</Button>
			{:else}
				{@render disabledBtn()}
			{/if}
		</SettingListItem>
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

{#snippet disabledBtn()}
	<div class="bg-muted-variant text-muted-foreground cursor-not-allowed rounded-md px-8 py-2.5 text-sm font-medium">
		Manage
	</div>
{/snippet}
