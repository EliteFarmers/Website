<script lang="ts">
	import SidebarLayout from '$comp/nav/sidebar-layout.svelte';
	import { PROFILE_NAV_PAGES } from '$content/nav';
</script>

<SidebarLayout navItems={PROFILE_NAV_PAGES} title="Player Profile">
	<slot />
</SidebarLayout>
