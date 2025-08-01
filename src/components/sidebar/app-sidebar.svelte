<script lang="ts" module>
	import { SIDEBAR_NAV } from '$content/sidebar';
	import Search from '@lucide/svelte/icons/search';
</script>

<script lang="ts">
	import SearchMenu from '$comp/header/search-menu.svelte';
	import NavMain from '$comp/sidebar/nav-main.svelte';
	import { getSidebarNav } from '$lib/hooks/sidebar-nav.svelte';
	import { cn } from '$lib/utils';
	import { ScrollArea } from '$ui/scroll-area';
	import * as Sidebar from '$ui/sidebar';
	import type { Snippet } from 'svelte';
	import NavDynamic from './nav-dynamic.svelte';
	import SideBarFooter from './side-bar-footer.svelte';

	let searchOpen = $state(false);

	let { children }: { children?: Snippet } = $props();

	const sidebarNav = getSidebarNav();
</script>

<Sidebar.Header class="mt-2">
	<Sidebar.MenuItem>
		<Sidebar.MenuButton size="lg">
			{#snippet tooltipContent()}
				Elite Farmers
			{/snippet}
			{#snippet child({ props })}
				<a
					href="/"
					{...props}
					class={cn(
						props.class ?? '',
						'group-data-[state=collapsed]:rounded-full group-data-[state=expanded]:-mt-2'
					)}
				>
					<img src="/favicon.webp" class="aspect-square max-w-8" alt="Elite Logo" />
					<span class="px-1 text-lg leading-none font-semibold md:text-xl">Elite Farmers</span>
				</a>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
	<Sidebar.MenuItem class="group-data-[state=collapsed]:mt-2">
		<Sidebar.MenuButton onclick={() => (searchOpen = true)} class="bg-card border-2 py-4">
			{#snippet tooltipContent()}
				Search
			{/snippet}
			<Search class="-ml-0.5" />
			<span class="text-muted-foreground">Search...</span>
		</Sidebar.MenuButton>
		<SearchMenu bind:open={searchOpen} useButton={false} />
	</Sidebar.MenuItem>
</Sidebar.Header>
<div class="flex h-full flex-col overflow-hidden">
	<ScrollArea class="h-full" orientation="vertical">
		<Sidebar.Content class="gap-0">
			{#if sidebarNav.current.length}
				<NavDynamic items={sidebarNav.current} title={sidebarNav.name} />
			{/if}
			<NavMain items={SIDEBAR_NAV} title="Main" />
			{@render children?.()}
		</Sidebar.Content>
	</ScrollArea>
</div>
<SideBarFooter />
<Sidebar.Rail />
