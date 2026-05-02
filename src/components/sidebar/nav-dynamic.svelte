<script lang="ts">
	import { page } from '$app/state';
	import * as Collapsible from '$comp/ui/collapsible/index.js';
	import * as DropdownMenu from '$comp/ui/dropdown-menu/index.js';
	import * as Sidebar from '$comp/ui/sidebar/index.js';
	import { isSidebarSectionGroup, type Crumb, type SidebarSection } from '$lib/hooks/page.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import type { Component, Snippet } from 'svelte';
	import { findActiveSidebarHref } from '../../lib/sidebar-active';

	let {
		section,
		onBack,
		hideOnCollapse = false,
		collapsed = undefined,
	}: {
		section: SidebarSection;
		onBack: () => void;
		hideOnCollapse?: boolean;
		collapsed?: Snippet;
	} = $props();

	const sidebar = Sidebar.useSidebar();
	const backLabel = $derived(section.backLabel ?? 'Back to main');
	const groups = $derived.by(() => {
		const items = section.items;
		if (items.length === 0) return [{ label: undefined, items: [] as Crumb[] }];
		if (isSidebarSectionGroup(items[0])) return items as { label?: string; items: Crumb[] }[];
		return [{ label: undefined, items: items as Crumb[] }];
	});
	const activeHref = $derived(findActiveSidebarHref(section.items, page.url.pathname));
</script>

{#if hideOnCollapse && sidebar.state === 'collapsed' && !sidebar.isMobile}
	{@render collapsed?.()}
{:else}
	<Sidebar.Group data-sveltekit-preload-data="tap">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="text-sidebar-foreground/70" onclick={onBack}>
					{#snippet tooltipContent()}
						{backLabel}
					{/snippet}
					<ArrowLeft class="size-4" />
					<span>{backLabel}</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Group>
	{#each groups as group, gi (gi)}
		<Sidebar.Group data-sveltekit-preload-data="tap">
			{#if group.label}
				<Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
			{/if}
			<Sidebar.Menu>
				{#each group.items as mainItem, i (i)}
					{@render content(mainItem, i === group.items.length - 1)}
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	{/each}
{/if}

{#snippet content(crumb: Crumb | Omit<Crumb, 'dropdown'>, open = false, drop = true)}
	{@const capital = crumb.capitalize === false ? '' : 'first-letter:capitalize'}
	{@const hasDrop = 'dropdown' in crumb && crumb.dropdown?.length}
	{#if drop && 'dropdown' in crumb && crumb.dropdown?.length}
		{#if sidebar.state === 'collapsed' && !sidebar.isMobile}
			<Sidebar.MenuItem>
				{#if crumb.href && !hasDrop}
					{@render link(crumb)}
				{:else}
					<Sidebar.MenuButton class="truncate md:max-w-none {capital}" onclick={() => sidebar.toggle()}>
						{@render inner(crumb)}
						{#snippet tooltipContent()}
							<span class="inline-block {capital}">{crumb.tooltip ?? crumb.name}</span>
						{/snippet}
					</Sidebar.MenuButton>
				{/if}
			</Sidebar.MenuItem>
		{:else if crumb.href}
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								{...props}
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground truncate md:max-w-none {capital}"
							>
								{#snippet tooltipContent()}
									<span class="inline-block {capital}">{crumb.tooltip ?? crumb.name}</span>
								{/snippet}
								{@render inner(crumb)}
								<ChevronsUpDown class="ml-auto size-4 opacity-60" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						side={sidebar.isMobile ? 'bottom' : 'right'}
						align="start"
						class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
					>
						<DropdownMenu.Group>
							{#each crumb.dropdown as item (item)}
								{@render dropdownItem(item)}
							{/each}
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		{:else}
			<Collapsible.Root {open} class="group/subcollapsible">
				<Sidebar.MenuItem class="px-0">
					<Collapsible.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton {...props}>
								{@render inner(crumb)}
								{#snippet tooltipContent()}
									<span class="inline-block {capital}">{crumb.tooltip ?? crumb.name}</span>
								{/snippet}
								<ChevronRight
									class="ml-auto transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90"
								/>
							</Sidebar.MenuButton>
						{/snippet}
					</Collapsible.Trigger>
					<Collapsible.Content>
						<Sidebar.MenuSub>
							{#each crumb.dropdown as item (item)}
								<Sidebar.MenuSubItem>
									{@render content(item, false, false)}
								</Sidebar.MenuSubItem>
							{/each}
						</Sidebar.MenuSub>
					</Collapsible.Content>
				</Sidebar.MenuItem>
			</Collapsible.Root>
		{/if}
	{:else}
		<Sidebar.MenuItem>
			{#if crumb.href && !hasDrop}
				{@render link(crumb)}
			{:else}
				<Sidebar.MenuButton class="truncate md:max-w-none {capital}">
					{@render inner(crumb)}
					{#snippet tooltipContent()}
						<span class="inline-block {capital}">{crumb.tooltip ?? crumb.name}</span>
					{/snippet}
				</Sidebar.MenuButton>
			{/if}
		</Sidebar.MenuItem>
	{/if}
{/snippet}

{#snippet inner(crumb: Crumb | Omit<Crumb, 'dropdown'>)}
	{@const capital = crumb.capitalize === false ? '' : 'first-letter:capitalize'}
	{#if crumb.icon}
		{@const Icon = crumb.icon as Component}
		<Icon class="size-4" {...crumb.data} />
	{/if}
	{#if crumb.snippet}
		{@render crumb.snippet(crumb)}
	{:else if crumb.name}
		<span class="max-w-28 truncate {capital}">
			{crumb.name}
		</span>
	{/if}
{/snippet}

{#snippet link(crumb: Crumb | Omit<Crumb, 'dropdown'>)}
	{@const capital = crumb.capitalize === false ? '' : 'first-letter:capitalize'}
	<Sidebar.MenuButton data-active={crumb.href === activeHref}>
		{#snippet tooltipContent()}
			<span class="inline-block {capital}">{crumb.tooltip ?? crumb.name}</span>
		{/snippet}
		{#snippet child({ props })}
			<a href={crumb.href} {...props}>
				{@render inner(crumb)}
			</a>
		{/snippet}
	</Sidebar.MenuButton>
{/snippet}

{#snippet dropdownItem(crumb: Omit<Crumb, 'dropdown'>)}
	{@const capital = crumb.capitalize === false ? '' : 'first-letter:capitalize'}
	{#if crumb.href}
		<DropdownMenu.LinkItem href={crumb.href}>
			{#if crumb.icon}
				{@const Icon = crumb.icon as Component}
				<Icon class="size-4 shrink-0" {...crumb.data} />
			{/if}
			{#if crumb.snippet}
				{@render crumb.snippet(crumb)}
			{:else if crumb.name}
				<span class="truncate {capital}">{crumb.name}</span>
			{/if}
		</DropdownMenu.LinkItem>
	{/if}
{/snippet}
