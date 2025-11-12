<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	/* eslint svelte/no-at-html-tags: "off" */
	// content is assumed to be sanitized already

	interface Props extends HTMLAttributes<HTMLDivElement> {
		content: string;
		wrap?: boolean;
	}

	let { content, wrap = true, ...props }: Props = $props();
</script>

{#if wrap}
	<div class="markdown contents" {...props}>
		{@html content}
	</div>
{:else}
	{@html content}
{/if}
