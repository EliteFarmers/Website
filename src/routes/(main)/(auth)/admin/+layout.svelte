<script lang="ts">
	import { ADMIN_NAV_PAGES } from '$content/nav';
	import { getPageCtx } from '$lib/hooks/page.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const pageCtx = getPageCtx();

	$effect.pre(() => {
		pageCtx.setSidebar('Admin', ADMIN_NAV_PAGES);
	});
</script>

{@render children?.()}
