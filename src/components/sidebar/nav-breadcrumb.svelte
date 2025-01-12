<script lang="ts">
	import { getBreadcrumb, type Crumb } from '$lib/hooks/breadcrumb.svelte';
	import * as Breadcrumb from '$ui/breadcrumb';
	import { useSidebar } from '$ui/sidebar';
	import * as Drawer from '$ui/drawer';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { buttonVariants } from '$ui/button';

	const crumbs = getBreadcrumb();
	let open = $state(false);
	const sidebar = useSidebar();

	const items = $derived(crumbs.override ?? crumbs.current);

	const first = $derived(items[0]);
	const last = $derived(items.length > 1 ? items.at(-1) : null);
	const middle = $derived(items.length > 2 ? items.slice(1, -1) : null);

	const maxMiddle = $derived(sidebar.isMobile ? 1 : 2);

	$inspect({ first, middle, last });
</script>

<Breadcrumb.Root>
	<Breadcrumb.List>
		{#if first}
			<Breadcrumb.Item>
				{@render content(first)}
			</Breadcrumb.Item>
		{/if}

		{#if middle && middle.length > 0}
			{#if middle.length > maxMiddle}
				<Breadcrumb.Separator />
				{@render collapsed(middle)}
			{:else}
				{#each middle as item}
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						{@render content(item)}
					</Breadcrumb.Item>
				{/each}
				<Breadcrumb.Separator />
			{/if}
		{:else}
			<Breadcrumb.Separator />
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
					<div class="grid gap-1 px-4">
						{#each crumbs as item}
							<a href={item.href ? item.href : '#'} class="py-1 text-sm first-letter:capitalize">
								{item.name}
							</a>
						{/each}
					</div>
					<Drawer.Footer class="pt-4">
						<Drawer.Close class={buttonVariants({ variant: 'outline' })}>Close</Drawer.Close>
					</Drawer.Footer>
				</Drawer.Content>
			</Drawer.Root>
		{/if}
	</Breadcrumb.Item>
	<Breadcrumb.Separator />
{/snippet}

{#snippet content(crumb: Crumb)}
	{#if crumb.href}
		<Breadcrumb.Link href={crumb.href} class="max-w-20 truncate first-letter:capitalize md:max-w-none">
			{#if crumb.icon}
				<crumb.icon class="size-4" />
			{/if}
			{#if crumb.name}
				{crumb.name}
			{/if}
		</Breadcrumb.Link>
	{:else}
		<Breadcrumb.Page class="max-w-20 truncate first-letter:capitalize md:max-w-none">
			{#if crumb.icon}
				<crumb.icon />
			{/if}
			{#if crumb.name}
				{crumb.name}
			{/if}
		</Breadcrumb.Page>
	{/if}
{/snippet}
