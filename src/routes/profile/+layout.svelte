<script lang="ts">
	import SidebarLayout from '$comp/nav/sidebar-layout.svelte';
	import { PROFILE_NAV_PAGES } from '$content/nav';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<SidebarLayout navItems={PROFILE_NAV_PAGES} title="Player Profile">
	{@render children?.()}
</SidebarLayout>
