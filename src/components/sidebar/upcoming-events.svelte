<script lang="ts">
	import SidebarCountdown from '$comp/events/sidebar-countdown.svelte';
	import * as Collapsible from '$comp/ui/collapsible/index.js';
	import * as Sidebar from '$comp/ui/sidebar/index.js';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import type { components } from '$lib/api/api';

	const sidebar = Sidebar.useSidebar();

	interface Props {
		events?: components['schemas']['EventDetailsDto'][];
	}

	let { events }: Props = $props();
</script>

{#if events?.length}
	<Sidebar.Group data-sveltekit-preload-data="tap">
		<Collapsible.Root open={true} class="group/collapsible">
			{#snippet child({ props })}
				<Sidebar.MenuItem {...props}>
					<Collapsible.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton {...props} class="text-sidebar-foreground/70">
								{#snippet tooltipContent()}
									Events
								{/snippet}
								{#if !sidebar.open && !sidebar.isMobile}
									<ChevronRight
										class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
									/>
								{/if}
								<span>Events</span>
								<ChevronRight
									class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
								/>
							</Sidebar.MenuButton>
						{/snippet}
					</Collapsible.Trigger>
					<Collapsible.Content>
						<Sidebar.Menu>
							{#each events as event (event.id)}
								{#if event.endTime && +(event.endTime ?? 0) * 1000 > Date.now()}
									{@render eventLink(event)}
								{/if}
							{/each}
						</Sidebar.Menu>
					</Collapsible.Content>
				</Sidebar.MenuItem>
			{/snippet}
		</Collapsible.Root>
	</Sidebar.Group>
{/if}

{#snippet eventLink(event: components['schemas']['EventDetailsDto'])}
	{@const href = `/event/${event.name.replaceAll(' ', '-') + '-' + event.id}`}
	{@const started = +(event.startTime ?? 0) * 1000 < Date.now()}
	<Sidebar.MenuItem class="my-0.5">
		<Sidebar.MenuButton data-active={href === page.url.pathname} size="xl">
			{#snippet tooltipContent()}
				{event.name}
			{/snippet}
			{#snippet child({ props })}
				<a
					{href}
					{...props}
					style={event?.banner?.url ? `background-image: url(${event.banner.url})` : ''}
					class={cn(props.class ?? '', 'bg-sidebar bg-cover p-1.5')}
				>
					<div
						class="z-10 flex h-full w-full flex-col justify-between overflow-hidden rounded-md bg-inherit p-1 px-1.5 group-data-[state=collapsed]:hidden"
					>
						<span class="flex-1 truncate text-lg font-semibold leading-none">{event.name}</span>
						<div class="flex w-full flex-row items-center justify-start gap-1">
							{#if started}
								<span class="text-sm text-muted-foreground">Ends In</span>
							{:else}
								<span class="text-sm text-muted-foreground">Starts In</span>
							{/if}
							<div class="flex flex-1 flex-row items-center justify-start">
								{#if event.startTime}
									<SidebarCountdown {event} />
								{:else}
									<span class="text-sm text-muted-foreground">No date set</span>
								{/if}
							</div>
						</div>
					</div>
				</a>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
{/snippet}
