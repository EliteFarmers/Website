<script lang="ts">
	import { ADMIN_NAV_PAGES } from '$content/nav';
	import type { AuthFlags } from '$lib/api/auth';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { createSidebarSection } from '$lib/sidebar-sections';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const pageCtx = getPageCtx();
	const gbl = getGlobalContext();
	const adminSidebarItems = $derived.by(() =>
		ADMIN_NAV_PAGES.filter((p) => p.exists(gbl.session?.perms || ({ viewAdminPages: false } as AuthFlags)))
	);
	const adminSidebarSection = $derived.by(() => createSidebarSection('admin', adminSidebarItems));

	$effect.pre(() => {
		pageCtx.setSidebarSection(adminSidebarSection);
	});
</script>

{@render children?.()}
