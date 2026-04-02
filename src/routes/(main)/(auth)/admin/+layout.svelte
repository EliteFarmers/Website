<script lang="ts">
	import { ADMIN_NAV_PAGES } from '$content/nav';
	import type { AuthFlags } from '$lib/api/auth';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getPageCtx } from '$lib/hooks/page.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const pageCtx = getPageCtx();
	const gbl = getGlobalContext();

	$effect.pre(() => {
		pageCtx.setSidebar(
			'Admin',
			ADMIN_NAV_PAGES.filter((p) => p.exists(gbl.session?.perms || ({ viewAdminPages: false } as AuthFlags)))
		);
	});
</script>

{@render children?.()}
