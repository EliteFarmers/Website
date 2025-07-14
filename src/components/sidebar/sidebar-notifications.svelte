<script lang="ts" module>
	import Settings from '@lucide/svelte/icons/settings';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Bell from '@lucide/svelte/icons/bell';
</script>

<script lang="ts">
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Sidebar from '$ui/sidebar';
	import { getGlobalContext } from '$lib/hooks/global.svelte';

	const ctx = getGlobalContext();
	const sidebar = Sidebar.useSidebar();

	const announcements = $derived(ctx.announcements);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Sidebar.MenuButton
				class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[state=collapsed]:rounded-full"
				{...props}
			>
				<Bell class="aspect-square size-8 items-center justify-center rounded-lg" />
				<span>Alerts</span>
				{#if announcements.length}
					<div
						class="bg-destructive ml-auto flex size-5 items-center justify-center rounded-full pb-0.5 text-sm leading-0 font-semibold text-white"
					>
						{announcements.length}
					</div>
				{:else if ctx.allAnnouncements.length}
					<div
						class="bg-muted ml-auto flex size-5 items-center justify-center rounded-full pb-0.5 text-sm leading-0 font-semibold text-white"
					>
						{ctx.allAnnouncements.length}
					</div>
				{/if}
			</Sidebar.MenuButton>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
		align="end"
		sideOffset={4}
		side={sidebar.isMobile ? 'top' : 'right'}
	>
		<DropdownMenu.Label class="p-0 font-normal">
			<!-- <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
					<Avatar.Root class="aspect-square size-8 items-center justify-center rounded-lg">
						<UserIcon user={session} class="aspect-square" />
					</Avatar.Root>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">{session.ign || session.username}</span>
						{#if session.ign && session.username}
							<span class="truncate text-xs">{session.username}</span>
						{/if}
					</div>
				</div> -->
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.LinkItem href="/profile">
				<Settings />
				Profile
			</DropdownMenu.LinkItem>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.LinkItem data-sveltekit-preload-data="off" href="/logout">
			<LogOut />
			Log out
		</DropdownMenu.LinkItem>
	</DropdownMenu.Content>
</DropdownMenu.Root>
