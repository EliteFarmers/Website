<script lang="ts">
	import { SIDEBAR_WIDTH } from '$ui/sidebar/constants';

	interface Props {
		children?: import('svelte').Snippet;
		sidebar?: import('svelte').Snippet;
	}

	let { children, sidebar }: Props = $props();
</script>

<div class="@container">
	<div class="relative flex flex-col @7xl:flex-row @7xl:gap-4" style="--sidebarWidth: {SIDEBAR_WIDTH};">
		<div class="mx-2 min-w-0 flex-1 md:mx-4">
			{@render children?.()}
		</div>

		<div class="hidden @7xl:block @7xl:w-(--sidebarWidth)">{@render sidebar?.()}</div>
	</div>
</div>
