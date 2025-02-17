<script lang="ts">
	import ExternalLink from 'lucide-svelte/icons/external-link';

	interface Props {
		href: string;
		text?: string | undefined;
		icon?: boolean;
		children?: import('svelte').Snippet;
	}

	let { href, text = undefined, icon = true, children }: Props = $props();
</script>

<a {href} class="inline-block text-link decoration-link">
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
