<script lang="ts">
	import { mdToHtml } from '$lib/md';
	/* eslint svelte/no-at-html-tags: "off" */
	// mdToHtml already sanitizes the HTML

	interface Props {
		content?: string | null;
	}

	let { content }: Props = $props();

	const sanitized = $derived(mdToHtml(content ?? ''));
</script>

<div class="markdown contents">
	{#await sanitized then html}
		{@html html}
	{/await}
</div>
