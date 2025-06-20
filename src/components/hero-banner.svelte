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
		'absolute left-0 right-0 top-16 flex h-96 flex-col items-center justify-center gap-4 bg-cover bg-center bg-no-repeat',
		className
	)}
	style={src ? `background-image: url('${src}')` : ''}
>
	<div class={!sidebar.isMobile ? (sidebar.open ? 'md:mr-66' : 'md:mr-28') : 'md:ml-8 md:mr-12'}>
		{@render children?.()}
	</div>
</div>
