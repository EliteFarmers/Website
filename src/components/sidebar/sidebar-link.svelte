<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$ui/sidebar';
	import type { Component } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		item: {
			title: string;
			href: string;
			icon?: Component;
		};
		icon?: string;
	}

	let { item, icon }: Props = $props();

	let active = $derived(item.href === page.url.pathname);
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
			</a>
		{/snippet}
	</Sidebar.MenuButton>
</Sidebar.MenuItem>
