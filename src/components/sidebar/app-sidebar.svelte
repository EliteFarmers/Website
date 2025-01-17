<script lang="ts" module>
	import Home from 'lucide-svelte/icons/home';
	import Search from 'lucide-svelte/icons/search';

	import { SIDEBAR_NAV } from '$content/sidebar';
</script>

<script lang="ts">
	import NavMain from '$comp/sidebar/nav-main.svelte';
	import * as Sidebar from '$ui/sidebar';
	import SideBarFooter from './side-bar-footer.svelte';
	import { ScrollArea } from '$ui/scroll-area';
	import SearchMenu from '$comp/header/search-menu.svelte';
	import { cn } from '$lib/utils';
	import { getSidebarNav } from '$lib/hooks/sidebar-nav.svelte';
	import NavDynamic from './nav-dynamic.svelte';

	let searchOpen = $state(false);

	const sidebarNav = getSidebarNav();
</script>

<Sidebar.Header class="mt-2">
	<Sidebar.MenuItem>
		<Sidebar.MenuButton size="lg">
			{#snippet tooltipContent()}
				Elite Farmers
			{/snippet}
			{#snippet child({ props })}
				<a href="/" {...props} class={cn(props.class ?? '', 'group-data-[state=collapsed]:rounded-full')}>
					<img src="/favicon.webp" class="aspect-square max-w-8" alt="Elite Logo" />
					<span class="px-1 text-lg font-semibold leading-none md:text-xl">Elite Farmers</span>
				</a>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
	<Sidebar.MenuItem class="group-data-[state=collapsed]:mt-3">
		<Sidebar.MenuButton onclick={() => (searchOpen = true)} class="border-2 bg-card py-4">
			{#snippet tooltipContent()}
				Search
			{/snippet}
			<Search class="-ml-0.5" />
			<span class="text-muted-foreground">Search...</span>
		</Sidebar.MenuButton>
		<SearchMenu bind:open={searchOpen} useButton={false} />
	</Sidebar.MenuItem>
</Sidebar.Header>
<ScrollArea class="h-full">
	<Sidebar.Content class="gap-0">
		{#if sidebarNav.current.length}
			<NavDynamic items={sidebarNav.current} title={sidebarNav.name} />
		{/if}
		<NavMain items={SIDEBAR_NAV} title="Main" icon={Home} />
	</Sidebar.Content>
</ScrollArea>
<SideBarFooter />
<Sidebar.Rail />
