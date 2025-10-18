<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	/* eslint svelte/no-at-html-tags: "off" */
	// content is assumed to be sanitized already

	interface Props extends HTMLAttributes<HTMLDivElement> {
		content: string;
	}

	let { content, ...props }: Props = $props();
</script>

<div class="markdown contents" {...props}>
	{@html content}
</div>
