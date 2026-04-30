<script lang="ts">
	import { page } from '$app/state';
	import { BROWSE_NAV_PAGES, createEventNavPages } from '$content/nav';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { createSidebarSection } from '$lib/sidebar-sections';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const pageCtx = getPageCtx();
	const eventSidebarItems = $derived.by(() =>
		page.params.event ? createEventNavPages(page.params.event) : BROWSE_NAV_PAGES
	);
	const eventSidebarSection = $derived.by(() => createSidebarSection('browse', eventSidebarItems));

	$effect.pre(() => {
		pageCtx.setSidebarSection(eventSidebarSection);
	});
</script>

{@render children?.()}
