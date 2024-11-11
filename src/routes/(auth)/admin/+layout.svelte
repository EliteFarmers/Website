<script lang="ts">
	import SidebarLayout from '$comp/nav/sidebar-layout.svelte';
	import { ADMIN_NAV_PAGES } from '$content/nav';
	
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<SidebarLayout navItems={ADMIN_NAV_PAGES} title="Admin Pages">
	{@render children?.()}
</SidebarLayout>
