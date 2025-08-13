<script lang="ts">
	import * as Sidebar from '$ui/sidebar';
	import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from '$ui/sidebar/constants';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const sidebar = Sidebar.useSidebar();
</script>

<div class="@container">
	<div
		class="mx-4 @7xl:mr-[calc(var(--sidebarWidth)+1rem)]"
		style="--sidebarWidth: {sidebar.open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON}"
	>
		{@render children?.()}
	</div>
</div>
