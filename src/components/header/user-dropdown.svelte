<script lang="ts">
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Avatar from '$ui/avatar';
	import * as Sidebar from '$ui/sidebar';
	import { buttonVariants } from '$ui/button';
	import { page } from '$app/state';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import UserRound from 'lucide-svelte/icons/user-round';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';

	import { cn } from '$lib/utils';

	let user = $derived(page.data.session);
	const sidebar = Sidebar.useSidebar();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Sidebar.MenuButton
				size="lg"
				class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				{...props}
			>
				<Avatar.Root class="aspect-square size-8 items-center justify-center rounded-lg">
					{#if user}
						<UserIcon {user} class="aspect-square" />
					{:else}
						<UserRound class="size-4" />
					{/if}
				</Avatar.Root>
				<div class="grid flex-1 text-left text-sm leading-tight">
					{#if user}
						<span class="truncate font-semibold">{user.ign ?? user.username}</span>
					{:else}
						<span class="truncate font-semibold">Login</span>
					{/if}
					<!-- <span class="truncate font-semibold">{user.name}</span>
					<span class="truncate text-xs">{user.email}</span> -->
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
			<DropdownMenu.Label class="font-normal">
				<div class="flex flex-col space-y-1">
					<p class="text-sm font-medium leading-none">{user.ign ?? user.username}</p>
					<p class="text-xs leading-none text-muted-foreground">{user.username}</p>
				</div>
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
				<DropdownMenu.LinkItem href="/profile">Account</DropdownMenu.LinkItem>
				<DropdownMenu.LinkItem href="/@{user.ign}" disabled={!user.ign}>My Stats</DropdownMenu.LinkItem>
				<DropdownMenu.LinkItem href="/@{user.ign}/rates" disabled={!user.ign}>My Rates</DropdownMenu.LinkItem>
				{#if user.flags.moderator}
					<DropdownMenu.LinkItem href="/admin">Admin</DropdownMenu.LinkItem>
				{/if}
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.LinkItem data-sveltekit-preload-data="off" href="/logout">Log out</DropdownMenu.LinkItem>
		{:else}
			<DropdownMenu.LinkItem data-sveltekit-preload-data="off" href="/login"
				>Login with Discord</DropdownMenu.LinkItem
			>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
