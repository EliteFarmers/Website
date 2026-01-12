<script lang="ts" module>
	import Bell from '@lucide/svelte/icons/bell';
</script>

<script lang="ts">
	import AnnouncementIcon from '$comp/header/announcement-icon.svelte';
	import RenderHtml from '$comp/markdown/render-html.svelte';
	import type { AnnouncementDto, NotificationDto } from '$lib/api';
	import { getAdCtx } from '$lib/hooks/ads.svelte';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import Button from '$ui/button/button.svelte';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import ScrollArea from '$ui/scroll-area/scroll-area.svelte';
	import * as Sidebar from '$ui/sidebar';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Check from '@lucide/svelte/icons/check';
	import Info from '@lucide/svelte/icons/info';

	const ctx = getGlobalContext();
	const sidebar = Sidebar.useSidebar();

	const announcements = $derived(ctx.announcements);
	const allAnnouncements = $derived(ctx.allAnnouncements);
	const notifications = $derived(ctx.notifications);

	const unreadCount = $derived(announcements.length + ctx.unreadNotificationsCount);

	const sortedItems = $derived(
		[
			...allAnnouncements.map((a) => ({ ...a, kind: 'announcement' as const })),
			...notifications.map((n) => ({ ...n, kind: 'notification' as const })),
		].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
	);

	const adCtx = getAdCtx();
</script>

<DropdownMenu.Root
	onOpenChange={(open) => {
		if (open) {
			adCtx.floatingVideoLeftMargin = 19.5;
		} else {
			adCtx.floatingVideoLeftMargin = 0;
		}
	}}
>
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
				{#if unreadCount > 0}
					<div
						class="bg-destructive ml-auto flex size-5 items-center justify-center rounded-full pb-0.5 text-sm leading-0 font-semibold text-white"
					>
						{unreadCount}
					</div>
				{/if}
			</Sidebar.MenuButton>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class="w-(--bits-dropdown-menu-anchor-width) min-w-56 overflow-y-auto rounded-lg lg:w-80"
		align="end"
		sideOffset={4}
		side={sidebar.isMobile ? 'top' : 'right'}
	>
		<DropdownMenu.Label class="py-2 text-sm font-semibold">Alerts</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<ScrollArea class="flex max-h-96 flex-col">
			{#each sortedItems as item, i (item.kind + item.id)}
				{#if item.kind === 'announcement'}
					{@const announcement = item as AnnouncementDto}
					{@const isDismissed = ctx.data.dismissedAnnouncements.includes(announcement.id)}
					<DropdownMenu.Item
						class="border-2 {isDismissed
							? 'border-transparent'
							: 'border-completed'} data-highlighted:bg-background"
					>
						<div class="flex w-full flex-col gap-1">
							<span class="text-sm font-semibold">
								<AnnouncementIcon {announcement} class="text-primary mr-1 mb-0.5 inline size-4" />
								{announcement.title}
							</span>
							<span class="text-muted-foreground text-xs">
								<RenderHtml content={announcement.content} />
							</span>
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
								{#if announcement.targetUrl && announcement.targetUrl !== '/'}
									<Button
										class="group mx-0 px-0! text-sm"
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
				{:else}
					{@const notification = item as NotificationDto}
					<DropdownMenu.Item
						class="border-2 {notification.isRead
							? 'border-transparent'
							: 'border-primary/50 bg-primary/5'} data-highlighted:bg-background"
					>
						<div class="flex w-full flex-col gap-1">
							<span class="flex items-center gap-1 text-sm font-semibold">
								<Info class="text-primary inline size-4" />
								{notification.title}
							</span>
							{#if notification.message}
								<div class="text-muted-foreground text-xs">
									<RenderHtml content={notification.message} />
								</div>
							{/if}
							<div class="flex flex-row items-end justify-between">
								{#if !notification.isRead}
									<Button
										class="p-0 text-sm"
										size="sm"
										variant="link"
										onclick={(e) => {
											e.preventDefault();
											ctx.markNotificationRead(notification.id);
										}}
									>
										<Check class="mr-1 size-3" />
										Mark as Read
									</Button>
								{:else}
									<span class="text-muted-foreground text-xs italic">Read</span>
								{/if}
								{#if notification.link}
									<Button
										class="group mx-0 ml-auto px-0! text-sm"
										size="sm"
										variant="link"
										href={notification.link}
									>
										View
										<ArrowRight
											class="text-primary group-hover:animate-bounce-horizontal ml-1 hidden size-4 md:inline"
										/>
									</Button>
								{/if}
							</div>
						</div>
					</DropdownMenu.Item>
				{/if}
				{#if i < sortedItems.length - 1}
					<DropdownMenu.Separator />
				{/if}
			{:else}
				<DropdownMenu.Item class="text-muted-foreground">No alerts!</DropdownMenu.Item>
			{/each}
		</ScrollArea>
	</DropdownMenu.Content>
</DropdownMenu.Root>
