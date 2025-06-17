<script lang="ts" module>
	import UserRound from '@lucide/svelte/icons/user-round';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Settings from '@lucide/svelte/icons/settings';
	import FileChartColumn from '@lucide/svelte/icons/file-chart-column';
	import Clover from '@lucide/svelte/icons/clover';
	import Shield from '@lucide/svelte/icons/shield';
	import LogOut from '@lucide/svelte/icons/log-out';
	import LogIn from '@lucide/svelte/icons/log-in';
</script>

<script lang="ts">
	import UserIcon from '$comp/discord/user-icon.svelte';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Avatar from '$ui/avatar';
	import * as Sidebar from '$ui/sidebar';
	import { page } from '$app/state';

	let user = $derived(page.data.session);
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
					{#if user}
						<UserIcon {user} class="aspect-square" />
					{:else}
						<UserRound class="size-4" />
					{/if}
				</Avatar.Root>
				<div class="grid flex-1 text-left text-sm">
					{#if user}
						<span class="truncate font-semibold">{user.ign || user.username}</span>
						{#if user.ign && user.username}
							<span class="truncate text-xs">{user.username}</span>
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
		class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
		align="end"
		sideOffset={4}
		side={sidebar.isMobile ? 'top' : 'right'}
	>
		{#if user}
			<DropdownMenu.Label class="p-0 font-normal">
				<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
					<Avatar.Root class="aspect-square size-8 items-center justify-center rounded-lg">
						<UserIcon {user} class="aspect-square" />
					</Avatar.Root>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">{user.ign || user.username}</span>
						{#if user.ign && user.username}
							<span class="truncate text-xs">{user.username}</span>
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
				<DropdownMenu.LinkItem href="/@{user.ign}" disabled={!user.ign}>
					<FileChartColumn />
					My Stats
				</DropdownMenu.LinkItem>
				<DropdownMenu.LinkItem href="/@{user.ign}/fortune" disabled={!user.ign}>
					<Clover />
					My Fortune
				</DropdownMenu.LinkItem>
				{#if user.flags.moderator}
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
			<DropdownMenu.LinkItem data-sveltekit-preload-data="off" href="/login">
				<LogIn />
				Login with Discord
			</DropdownMenu.LinkItem>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
