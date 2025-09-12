<script lang="ts">
	import { getHtmlFromMarkdown } from '$lib/remote/md.remote';
	/* eslint svelte/no-at-html-tags: "off" */
	// mdToHtml already sanitizes the HTML

	interface Props {
		content?: string | null;
	}

	let { content }: Props = $props();

	const sanitized = getHtmlFromMarkdown(content ?? '');
</script>

<div class="markdown contents">
	{#await sanitized then html}
		{@html html}
	{/await}
</div>
