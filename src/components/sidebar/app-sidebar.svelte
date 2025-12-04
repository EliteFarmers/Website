<script lang="ts" module>
	import { SIDEBAR_NAV } from '$content/sidebar';
</script>

<script lang="ts">
	import NavMain from '$comp/sidebar/nav-main.svelte';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { cn } from '$lib/utils';
	import { ScrollArea } from '$ui/scroll-area';
	import * as Sidebar from '$ui/sidebar';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import type { Snippet } from 'svelte';
	import NavDynamic from './nav-dynamic.svelte';
	import SideBarFooter from './side-bar-footer.svelte';

	let { children }: { children?: Snippet } = $props();

	const pageCtx = getPageCtx();
	const gbl = getGlobalContext();
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
					<span class="px-1 leading-none font-semibold sm:text-lg md:text-xl">Elite Farmers</span>
				</a>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
	<Sidebar.MenuItem class="group-data-[state=collapsed]:mt-2">
		<Sidebar.MenuButton>
			{#snippet tooltipContent()}
				Shop
			{/snippet}
			{#snippet child({ props })}
				<a
					href="/shop"
					{...props}
					class={cn(
						props.class ?? '',
						'bg-card text-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground relative mx-0 border shadow-sm transition-all duration-300 group-data-[state=collapsed]:px-1.5! group-data-[state=expanded]:px-2'
					)}
				>
					{#if gbl.user?.settings.features?.hideShopPromotions !== true}
						<div class="bg-primary/15 absolute -top-24 -right-24 h-32 w-32 rounded-full blur-xl"></div>
						<div class="bg-primary/10 absolute -bottom-24 -left-24 h-32 w-32 rounded-full blur-xl"></div>
					{/if}
					<ShoppingCart class="text-primary m-0 size-5 p-0" />
					<span class="text-primary font-semibold">Shop</span>
				</a>
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
</Sidebar.Header>
<div class="flex h-full flex-col overflow-hidden">
	<ScrollArea class="h-full" orientation="vertical">
		<Sidebar.Content class="gap-0">
			{#if pageCtx.sidebar.length && pageCtx.above}
				<NavDynamic items={pageCtx.sidebar} title={pageCtx.sidebarName} />
			{/if}
			<NavMain items={SIDEBAR_NAV} title="Main" />
			{#if pageCtx.sidebar.length && !pageCtx.above}
				<NavDynamic items={pageCtx.sidebar} title={pageCtx.sidebarName} />
			{/if}
			{@render children?.()}
		</Sidebar.Content>
	</ScrollArea>
</div>
<SideBarFooter />
<Sidebar.Rail />
