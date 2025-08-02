<script lang="ts">
	import { PROFILE_NAV_PAGES } from '$content/nav';
	import { getSidebarNav } from '$lib/hooks/sidebar-nav.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const sidebar = getSidebarNav();

	$effect.pre(() => {
		sidebar.setNav('Account', PROFILE_NAV_PAGES);
	});
</script>

<div class="contents md:flex md:flex-col md:items-center">
	{@render children?.()}
</div>
