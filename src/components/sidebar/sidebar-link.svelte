<script lang="ts">
	import { page } from '$app/state';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import * as Sidebar from '$ui/sidebar';
	import { untrack, type Component } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		item: {
			title: string;
			href: string;
			icon?: Component;
			new?: number;
		};
		icon?: string;
	}

	let { item, icon }: Props = $props();

	let active = $derived(item.href === page.url.pathname);

	const gbl = getGlobalContext();

	$effect.pre(() => {
		if (active && item.new) {
			untrack(() => {
				gbl.markSidebarItemSeen(item.href, item.new ?? 0);
			});
		}
	});
</script>

<Sidebar.MenuItem>
	<Sidebar.MenuButton data-active={active}>
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
				{#if item.new && !gbl.seenSidebarItem(item.href, item.new)}
					<span class="bg-destructive/50 text-primary ml-auto rounded-sm px-2 py-0.5 text-xs font-medium"
						>New</span
					>
				{/if}
			</a>
		{/snippet}
	</Sidebar.MenuButton>
</Sidebar.MenuItem>
