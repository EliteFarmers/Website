<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		href: string;
		open: boolean;
		class?: string | undefined | null;
		children?: import('svelte').Snippet;
	}

	let { href, open = $bindable(), class: className = undefined, children, ...rest }: Props = $props();
</script>

<a
	{href}
	class={cn($page.url.pathname === href ? 'text-foreground' : 'text-foreground/60', className)}
	onclick={() => (open = false)}
	{...rest}
>
	{@render children?.()}
</a>
