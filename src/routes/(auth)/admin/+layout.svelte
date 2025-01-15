<script lang="ts">
	import { ADMIN_NAV_PAGES } from '$content/nav';
	import { getSidebarNav } from '$lib/hooks/sidebar-nav.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const sidebar = getSidebarNav();

	$effect.pre(() => {
		sidebar.setNav('Admin', ADMIN_NAV_PAGES);
	});
</script>

<div class="mx-4 md:mx-8">
	{@render children?.()}
</div>
