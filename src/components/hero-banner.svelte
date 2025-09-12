<script lang="ts">
	import { cn } from '$lib/utils';
	import { useSidebar } from '$ui/sidebar';
	import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from '$ui/sidebar/constants';

	interface Props {
		src?: string;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { src, children, class: className }: Props = $props();

	const sidebar = useSidebar();
</script>

<div
	class={cn(
		'absolute top-0 right-0 left-0 flex h-96 flex-col items-center justify-center gap-4 bg-cover bg-center bg-no-repeat',
		className
	)}
	style={src ? `background-image: url('${src}')` : ''}
>
	<div
		class="mx-4 @7xl:mr-[calc(var(--sidebarWidth)+1rem)]"
		style="--sidebarWidth: {sidebar.open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON}"
	>
		{@render children?.()}
	</div>
</div>
