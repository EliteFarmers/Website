<script lang="ts">
	import { page } from '$app/state';
	import { BROWSE_NAV_PAGES, createServerNavPages } from '$content/nav';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { createSidebarSection } from '$lib/sidebar-sections';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const pageCtx = getPageCtx();
	const serverSidebarItems = $derived.by(() =>
		page.params.guild ? createServerNavPages(page.params.guild) : BROWSE_NAV_PAGES
	);
	const serverSidebarSection = $derived.by(() => createSidebarSection('browse', serverSidebarItems));

	$effect.pre(() => {
		pageCtx.setSidebarSection(serverSidebarSection);
	});
</script>

{@render children?.()}
