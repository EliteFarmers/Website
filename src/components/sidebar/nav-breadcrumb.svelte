<script lang="ts" module>
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Slash from 'lucide-svelte/icons/slash';
</script>

<script lang="ts">
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';
	import * as Breadcrumb from '$ui/breadcrumb';
	import { useSidebar } from '$ui/sidebar';
	import * as Drawer from '$ui/drawer';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { buttonVariants } from '$ui/button';
	import ScrollArea from '$ui/scroll-area/scroll-area.svelte';
	import type { Component } from 'svelte';

	const crumbs = getBreadcrumb();
	let open = $state(false);
	const sidebar = useSidebar();

	const items = $derived(crumbs.override ?? crumbs.current);

	const first = $derived(items[0]);
	const showFirst = $derived(first && !sidebar.isMobile);

	const last = $derived(items.length > 1 ? items.at(-1) : null);
	const middle = $derived(items.length > 2 ? items.slice(1, -1) : null);

	const maxMiddle = $derived(sidebar.size.mobile ? 1 : sidebar.size.medium ? 2 : sidebar.size.large ? 3 : 5);
</script>

<Breadcrumb.Root data-sveltekit-preload-data="tap">
	<Breadcrumb.List>
		{#if showFirst}
			<Breadcrumb.Item>
				{@render content(first)}
			</Breadcrumb.Item>
		{/if}

		{#if middle && middle.length > 0}
			{#if middle.length > maxMiddle}
				{#if showFirst}
					{@render separator()}
				{/if}
				{@render collapsed(middle)}
			{:else}
				{#each middle as item, i}
					{#if i > 0 || showFirst}
						{@render separator()}
					{/if}
					<Breadcrumb.Item>
						{@render content(item)}
					</Breadcrumb.Item>
				{/each}
				{@render separator()}
			{/if}
		{:else if last && showFirst}
			{@render separator()}
		{/if}

		{#if last}
			<Breadcrumb.Item>
				{@render content(last)}
			</Breadcrumb.Item>
		{/if}
	</Breadcrumb.List>
</Breadcrumb.Root>

{#snippet collapsed(crumbs: Crumb[])}
	<Breadcrumb.Item>
		{#if !sidebar.isMobile}
			<DropdownMenu.Root bind:open>
				<DropdownMenu.Trigger class="flex items-center gap-1" aria-label="Toggle menu">
					<Breadcrumb.Ellipsis class="size-4" />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start">
					{#each crumbs as item}
						<DropdownMenu.Item>
							<a href={item.href ? item.href : '#'} class="first-letter:capitalize">
								{item.name}
							</a>
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{:else}
			<Drawer.Root bind:open>
				<Drawer.Trigger aria-label="Toggle Menu">
					<Breadcrumb.Ellipsis class="size-4" />
				</Drawer.Trigger>
				<Drawer.Content>
					<Drawer.Header class="text-left">
						<Drawer.Title>Navigate to</Drawer.Title>
						<Drawer.Description>Select a page to navigate to.</Drawer.Description>
					</Drawer.Header>
					<div class="grid gap-4 px-4">
						{#each crumbs as item (item)}
							{@render content(item)}
						{/each}
					</div>
					<Drawer.Footer class="pt-4">
						<Drawer.Close class={buttonVariants({ variant: 'outline' })}>Close</Drawer.Close>
					</Drawer.Footer>
				</Drawer.Content>
			</Drawer.Root>
		{/if}
	</Breadcrumb.Item>
	{@render separator()}
{/snippet}

{#snippet content(crumb: Crumb | Omit<Crumb, 'dropdown'>, drop = true)}
	{#if drop && 'dropdown' in crumb && crumb.dropdown?.length}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="flex items-center gap-1">
				{@render content(crumb, false)}
				<ChevronDown class="size-4" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start">
				<ScrollArea orientation="vertical" class="flex max-h-48 flex-col overflow-y-auto">
					{#each crumb.dropdown as item (item)}
						<DropdownMenu.Item>
							{@render content(item)}
						</DropdownMenu.Item>
					{/each}
				</ScrollArea>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{:else if crumb.href}
		<Breadcrumb.Link href={crumb.href} class="w-full truncate first-letter:capitalize md:max-w-none">
			{@render inner(crumb)}
		</Breadcrumb.Link>
	{:else}
		<Breadcrumb.Page class="truncate first-letter:capitalize md:max-w-none">
			{@render inner(crumb)}
		</Breadcrumb.Page>
	{/if}
{/snippet}

{#snippet inner(crumb: Crumb | Omit<Crumb, 'dropdown'>)}
	{#if crumb.icon}
		{@const Icon = crumb.icon as Component}
		<Icon class="size-4" {...crumb.data} />
	{/if}
	{#if crumb.snippet}
		{@render crumb.snippet(crumb)}
	{:else if crumb.name}
		<span class="inline-block max-w-28 truncate first-letter:capitalize">
			{crumb.name}
		</span>
	{/if}
{/snippet}

{#snippet separator()}
	<Breadcrumb.Separator>
		<Slash />
	</Breadcrumb.Separator>
{/snippet}
