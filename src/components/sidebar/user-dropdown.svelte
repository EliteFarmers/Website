<script lang="ts" module>
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Clover from '@lucide/svelte/icons/clover';
	import FileChartColumn from '@lucide/svelte/icons/file-chart-column';
	import LogIn from '@lucide/svelte/icons/log-in';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Settings from '@lucide/svelte/icons/settings';
	import Shield from '@lucide/svelte/icons/shield';
	import UserRound from '@lucide/svelte/icons/user-round';
</script>

<script lang="ts">
	import { page } from '$app/state';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import * as Avatar from '$ui/avatar';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Sidebar from '$ui/sidebar';

	const ctx = getGlobalContext();
	const session = $derived(ctx.initialized ? ctx.session : null);

	const sidebar = Sidebar.useSidebar();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Sidebar.MenuButton
				size="lg"
				class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[state=collapsed]:rounded-full"
				{...props}
			>
				<Avatar.Root class="aspect-square size-8 items-center justify-center rounded-lg">
					{#if session}
						<UserIcon user={session} class="aspect-square" />
					{:else}
						<UserRound class="size-4" />
					{/if}
				</Avatar.Root>
				<div class="grid flex-1 text-left text-sm">
					{#if session}
						<span class="truncate font-semibold">{session.fIgn || session.username}</span>
						{#if session.ign && session.username}
							<span class="truncate text-xs">{session.username}</span>
						{/if}
					{:else}
						<span class="truncate font-semibold">Login</span>
					{/if}
				</div>
				<ChevronsUpDown class="ml-auto size-4" />
			</Sidebar.MenuButton>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
		align="end"
		sideOffset={4}
		side={sidebar.isMobile ? 'top' : 'right'}
	>
		{#if session}
			<DropdownMenu.Label class="p-0 font-normal">
				<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
					<Avatar.Root class="aspect-square size-8 items-center justify-center rounded-lg">
						<UserIcon user={session} class="aspect-square" />
					</Avatar.Root>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">{session.ign || session.username}</span>
						{#if session.ign && session.username}
							<span class="truncate text-xs">{session.username}</span>
						{/if}
					</div>
				</div>
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
				<DropdownMenu.LinkItem href="/profile">
					<Settings />
					Profile
				</DropdownMenu.LinkItem>
				<DropdownMenu.LinkItem href="/@{session.ign}" disabled={!session.ign}>
					<FileChartColumn />
					My Stats
				</DropdownMenu.LinkItem>
				<DropdownMenu.LinkItem href="/@{session.ign}/fortune" disabled={!session.ign}>
					<Clover />
					My Fortune
				</DropdownMenu.LinkItem>
				{#if session.perms.moderator}
					<DropdownMenu.LinkItem href="/admin">
						<Shield />
						Admin
					</DropdownMenu.LinkItem>
				{/if}
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.LinkItem data-sveltekit-preload-data="off" href="/logout">
				<LogOut />
				Log out
			</DropdownMenu.LinkItem>
		{:else}
			<DropdownMenu.LinkItem
				data-sveltekit-preload-data="off"
				href="/login?redirect={encodeURIComponent(page.url.pathname + page.url.search + page.url.hash)}"
			>
				<LogIn />
				Login with Discord
			</DropdownMenu.LinkItem>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
