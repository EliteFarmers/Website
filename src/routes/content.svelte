<script lang="ts">
	import * as Sidebar from '$ui/sidebar';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const sidebar = Sidebar.useSidebar();
</script>

<div class="mx-4 {!sidebar.isMobile ? (sidebar.open ? 'md:mr-66' : 'md:mr-28') : 'md:mr-12 md:ml-8'} @container">
	{@render children?.()}
</div>
