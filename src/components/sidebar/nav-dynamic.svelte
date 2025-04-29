<script lang="ts">
	import * as Collapsible from '$comp/ui/collapsible/index.js';
	import * as Sidebar from '$comp/ui/sidebar/index.js';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Crumb } from '$lib/hooks/breadcrumb.svelte';
	import type { Component } from 'svelte';
	import { page } from '$app/state';

	let {
		items,
		title = 'Group',
	}: {
		items: Crumb[];
		title: string;
	} = $props();

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Group data-sveltekit-preload-data="tap">
	<Collapsible.Root open={true} class="group/collapsible">
		{#snippet child({ props })}
			<Sidebar.MenuItem {...props}>
				<Collapsible.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton {...props} class="text-sidebar-foreground/70">
							{#snippet tooltipContent()}
								<span class="inline-block first-letter:capitalize">{title}</span>
							{/snippet}
							{#if !sidebar.open && !sidebar.isMobile}
								<ChevronRight
									class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
								/>
							{/if}
							<span>{title}</span>
							<ChevronRight
								class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
							/>
						</Sidebar.MenuButton>
					{/snippet}
				</Collapsible.Trigger>
				<Collapsible.Content>
					<Sidebar.Menu>
						{#each items as mainItem, i (i)}
							{@render content(mainItem, i === items.length - 1)}
						{/each}
					</Sidebar.Menu>
				</Collapsible.Content>
			</Sidebar.MenuItem>
		{/snippet}
	</Collapsible.Root>
</Sidebar.Group>

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
	<Sidebar.MenuButton data-active={crumb.href === page.url.pathname}>
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
