<script lang="ts">
	import { PROFILE_NAV_PAGES } from '$content/nav';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { createSidebarSection } from '$lib/sidebar-sections';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const pageCtx = getPageCtx();
	const accountSidebarSection = createSidebarSection('account', PROFILE_NAV_PAGES);

	$effect.pre(() => {
		pageCtx.setSidebarSection(accountSidebarSection);
	});
</script>

<div class="contents md:flex md:flex-col md:items-center">
	{@render children?.()}
</div>
