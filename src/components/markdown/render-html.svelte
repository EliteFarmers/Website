<script lang="ts">
	/* eslint svelte/no-at-html-tags: "off" */
	// content is assumed to be sanitized already

	interface Props {
		content: string;
	}

	let { content }: Props = $props();
</script>

<div class="markdown contents">
	{@html content}
</div>
