<script lang="ts">
	import * as Sidebar from '$ui/sidebar';
	import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from '$ui/sidebar/constants';

	interface Props {
		children?: import('svelte').Snippet;
		sidebar?: import('svelte').Snippet;
	}

	let { children, sidebar }: Props = $props();

	const sidebarState = Sidebar.useSidebar();
</script>

<div class="@container">
	<div
		class="relative flex flex-col @7xl:flex-row @7xl:gap-4"
		style="--sidebarWidth: {sidebarState.open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON};"
	>
		<div class="min-w-0 flex-1">
			{@render children?.()}
		</div>

		<div class="block @7xl:w-[var(--sidebarWidth)]">{@render sidebar?.()}</div>
	</div>
</div>
