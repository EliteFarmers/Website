<script lang="ts">
	import { PROFILE_NAV_PAGES } from '$content/nav';
	import { getPageCtx } from '$lib/hooks/page.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const pageCtx = getPageCtx();

	$effect.pre(() => {
		pageCtx.setSidebar('Account', PROFILE_NAV_PAGES);
	});
</script>

<div class="contents md:flex md:flex-col md:items-center">
	{@render children?.()}
</div>
