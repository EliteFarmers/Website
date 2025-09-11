<script lang="ts">
	import { cn } from '$lib/utils';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	interface Props {
		href: string;
		text?: string | undefined;
		icon?: boolean;
		class?: string | undefined;
		children?: import('svelte').Snippet;
	}

	let { href, text = undefined, icon = true, children, class: className = '' }: Props = $props();
</script>

<a {href} class={cn('text-link decoration-link inline-block', className)}>
	<span class="flex flex-row items-center gap-1">
		{#if text}
			<span>{text}</span>
		{:else}
			<span>
				{@render children?.()}
			</span>
		{/if}
		{#if icon}
			<ExternalLink size={16} class="mt-0.5" />
		{/if}
	</span>
</a>
