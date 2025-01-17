<script lang="ts">
	import * as Sidebar from '$ui/sidebar';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const sidebar = Sidebar.useSidebar();
</script>

<div class="mx-4 {!sidebar.isMobile ? (sidebar.open ? 'md:mr-[16.5rem]' : 'md:mr-[7rem]') : 'md:ml-8 md:mr-12'}">
	{@render children?.()}
</div>
