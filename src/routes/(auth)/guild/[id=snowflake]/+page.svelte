<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import GuildIcon from '$comp/discord/guild-icon.svelte';
	import RoleSelect from '$comp/discord/role-select.svelte';
	import ExternalLinkButton from '$comp/external-link-button.svelte';
	import Head from '$comp/head.svelte';
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import SettingSeperator from '$comp/settings/setting-seperator.svelte';
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import * as Alert from '$ui/alert';
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

	const breadcrumb = getPageCtx();
	const favorites = getFavoritesContext();

	$effect.pre(() => {
		breadcrumb.setBreadcrumbs(crumbs);
		favorites.setPage({
			icon: data.guild.icon?.url ?? undefined,
			name: data.guild?.name ?? 'Guild Settings',
			href: page.url.pathname,
		});
	});
</script>

<Head title={data.guild?.name ?? 'Guild Settings'} description="Manage server settings for your guild!" />

<div class="@container-normal mx-auto flex max-w-4xl flex-col items-center gap-8">
	<div class="flex flex-row items-center gap-4">
		<GuildIcon guild={data.guild} size={16} />
		<h1 class="my-16 text-4xl">
			{data.guild?.name}
		</h1>
		{#if data.guild?.public}
			<Button href="/server/{data.guildId}" variant="outline">
				<ExternalLink size={16} />
			</Button>
		{/if}
	</div>

	<Alert.Root class="border-link/30 w-full max-w-4xl border-2">
		<Alert.Title class="text-lg">Want to unlock a feature?</Alert.Title>
		<Alert.Description class="text-base">
			<p>
				Subscribe to the appropriate package in the
				<ExternalLinkButton href="/support">support server's</ExternalLinkButton> built-in Discord Shop and/or open
				a ticket in the support server to discuss options!
			</p>
		</Alert.Description>
	</Alert.Root>

	{#if form?.error}
		<p class="text-destructive">{form.error}</p>
	{/if}

	<section class="grid grid-cols-1 gap-4 @[37.5rem]:grid-cols-2">
		<Card.Root class="size-full flex-1 rounded-lg border-2">
			<Card.Header>
				<Card.Title class="text-xl">Server Invite</Card.Title>
			</Card.Header>
			<Card.Content class="flex h-full flex-col items-center gap-2 self-stretch">
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
					<Input name="invite" placeholder="Invite Code" maxlength={64} />
					<Button type="submit">Set</Button>
				</form>
			</Card.Content>
		</Card.Root>
		<Card.Root class="size-full flex-1 rounded-lg border-2">
			<Card.Header>
				<Card.Title class="text-xl">Admin Role</Card.Title>
			</Card.Header>
			<Card.Content class="flex h-full flex-col items-center gap-2 self-stretch">
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

	<section class="bg-card flex w-full max-w-4xl flex-col rounded-lg border-2 p-4">
		<SettingListItem
			title="Upcoming Contest Pings"
			class={!features?.contestPingsEnabled ? 'cursor-not-allowed opacity-50 select-none' : undefined}
		>
			{#snippet subtitle()}
				<span class="text-muted-foreground text-sm">Manage your server specific contest pings!</span>
			{/snippet}
			<Button href="/guild/{data.guildId}/pings" class="px-8" disabled={!features?.contestPingsEnabled}
				>Manage</Button
			>
		</SettingListItem>
		<SettingSeperator />
		<SettingListItem
			title="Jacob Leaderboards"
			class={!features?.jacobLeaderboardEnabled ? 'cursor-not-allowed opacity-50 select-none' : undefined}
		>
			{#snippet subtitle()}
				<span class="text-muted-foreground text-sm">Manage your server specific jacob leaderboards!</span>
			{/snippet}
			<Button href="/guild/{data.guildId}/jacob" class="px-8" disabled={!features?.jacobLeaderboardEnabled}
				>Manage</Button
			>
		</SettingListItem>
		<SettingSeperator />
		<SettingListItem
			title="Server Events"
			class={!features?.eventsEnabled ? 'cursor-not-allowed opacity-50 select-none' : undefined}
		>
			{#snippet subtitle()}
				<span class="text-muted-foreground text-sm">Manage your server specific events!</span>
			{/snippet}

			<Button href="/guild/{data.guildId}/events" class="px-8" disabled={!features?.eventsEnabled}>Manage</Button>
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
