<script lang="ts" module>
	import Bell from '@lucide/svelte/icons/bell';
</script>

<script lang="ts">
	import AnnouncementIcon from '$comp/header/announcement-icon.svelte';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import Button from '$ui/button/button.svelte';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Sidebar from '$ui/sidebar';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	const ctx = getGlobalContext();
	const sidebar = Sidebar.useSidebar();

	const announcements = $derived(ctx.announcements);
	const allAnnouncements = $derived(ctx.allAnnouncements);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Sidebar.MenuButton
				class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[state=collapsed]:rounded-full"
				{...props}
			>
				<Bell
					class="mx-2 mt-0.5 aspect-square size-8 items-center justify-center rounded-lg group-data-[state=collapsed]:mx-0"
				/>
				<span>Alerts</span>
				{#if announcements.length}
					<div
						class="bg-destructive ml-auto flex size-5 items-center justify-center rounded-full pb-0.5 text-sm leading-0 font-semibold text-white"
					>
						{announcements.length}
					</div>
				{/if}
			</Sidebar.MenuButton>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg lg:w-80"
		align="end"
		sideOffset={4}
		side={sidebar.isMobile ? 'top' : 'right'}
	>
		<DropdownMenu.Label class="py-2 text-sm font-semibold">Alerts</DropdownMenu.Label>
		<DropdownMenu.Separator />
		{#each allAnnouncements as announcement, i (announcement.id)}
			{@const isDismissed = ctx.data.dismissedAnnouncements.includes(announcement.id)}
			<DropdownMenu.Item
				class="border-2 {isDismissed
					? 'border-transparent'
					: 'border-completed'} data-highlighted:bg-background"
			>
				<div class="flex flex-col gap-1">
					<span class="text-sm font-semibold">
						<AnnouncementIcon {announcement} class="text-primary mr-1 mb-0.5 inline size-4" />
						{announcement.title}
					</span>
					<span class="text-muted-foreground text-xs">{announcement.content}</span>
					<div class="flex flex-row justify-between">
						{#if !isDismissed}
							<Button
								class="p-0 text-sm"
								size="sm"
								variant="link"
								onclick={() => {
									ctx.dismissAnnouncement(announcement.id);
								}}
							>
								Mark as Read
							</Button>
						{/if}
						{#if announcement.targetUrl !== '/'}
							<Button
								class="group mx-0 !px-0 text-sm"
								size="sm"
								variant="link"
								href={announcement.targetUrl}
							>
								{announcement.targetLabel ?? 'Read More'}
								<ArrowRight
									class="text-primary group-hover:animate-bounce-horizontal ml-1 hidden size-4 md:inline"
								/>
							</Button>
						{/if}
					</div>
				</div>
			</DropdownMenu.Item>
			{#if i < allAnnouncements.length - 1}
				<DropdownMenu.Separator />
			{/if}
		{:else}
			<DropdownMenu.Item class="text-muted-foreground">No alerts!</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
