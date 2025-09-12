<script lang="ts">
	/* eslint svelte/no-at-html-tags: "off" */
	import DOMPurify from 'isomorphic-dompurify';

	interface Props {
		content: string;
	}

	let { content }: Props = $props();

	const sanitized = $derived(DOMPurify.sanitize(content));
</script>

<div class="markdown contents">
	{@html sanitized}
</div>
