<script lang="ts">
	import SidebarNav from '$comp/nav/sidebar-nav.svelte';

	export let title: string;
    export let navItems: { title: string; href: string; external?: boolean }[];
</script>

<div class="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6">
	<aside
		class="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0
		flex-col overflow-y-auto pb-2 md:sticky md:flex"
	>
		<div class="py-6 pr-6 lg:py-8">
			<SidebarNav navItems={[{ title, items: navItems }]} />
		</div>
	</aside>
	<div id="main" class="mx-auto w-full min-w-0">
		<slot />
	</div>
</div>