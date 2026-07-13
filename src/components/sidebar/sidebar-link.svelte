<script lang="ts">
	import { page } from '$app/state';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import * as Sidebar from '$ui/sidebar';
	import { untrack, type Component } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { isSidebarHrefActive } from '../../lib/sidebar-active';

	interface Props extends HTMLAnchorAttributes {
		item: {
			title: string;
			href: string;
			icon?: Component;
			new?: number;
		};
		icon?: string;
		active?: boolean;
	}

	let { item, icon, active = false }: Props = $props();

	let isActive = $derived(active || isSidebarHrefActive(item.href, page.url.pathname));

	const gbl = getGlobalContext();
	const newExpiresAtMs = $derived((item.new ?? 0) * 1000);
	const showNew = $derived(
		item.new !== undefined && Date.now() < newExpiresAtMs && !gbl.seenSidebarItem(item.href, item.new)
	);

	$effect.pre(() => {
		if (isActive && item.new !== undefined) {
			const newExpiresAt = item.new;
			untrack(() => {
				gbl.markSidebarItemSeen(item.href, newExpiresAt);
			});
		}
	});
</script>

<Sidebar.MenuItem>
	<Sidebar.MenuButton data-active={isActive}>
		{#snippet tooltipContent()}
			{item.title}
		{/snippet}
		{#snippet child({ props })}
			<a href={item.href} {...props}>
				{#if icon}
					<img src={icon} alt="Icon" class="size-4 rounded-sm" />
				{/if}
				{#if item.icon}
					<item.icon />
				{/if}
				<span>{item.title}</span>
				{#if showNew}
					<span class="bg-destructive/50 text-primary ml-auto rounded-sm px-2 py-0.5 text-xs font-medium"
						>New</span
					>
				{/if}
			</a>
		{/snippet}
	</Sidebar.MenuButton>
</Sidebar.MenuItem>
