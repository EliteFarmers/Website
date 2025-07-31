<script lang="ts">
	import { cn } from '$lib/utils';
	import { useSidebar } from '$ui/sidebar';

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
		'absolute top-16 right-0 left-0 flex h-96 flex-col items-center justify-center gap-4 bg-cover bg-center bg-no-repeat',
		className
	)}
	style={src ? `background-image: url('${src}')` : ''}
>
	<div class={!sidebar.isMobile ? (sidebar.open ? 'md:mr-66' : 'md:mr-28') : 'md:mr-12 md:ml-8'}>
		{@render children?.()}
	</div>
</div>
