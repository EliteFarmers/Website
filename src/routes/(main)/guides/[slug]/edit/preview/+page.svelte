<script lang="ts">
	import BlockRenderer from '$comp/blocks/block-renderer.svelte';
	import RenderMd from '$comp/markdown/render-md.svelte';
	import { getGuideEditContext } from '$lib/guides/edit-state.svelte';
	import { Card, CardDescription, CardHeader, CardTitle } from '$ui/card';

	const edit = getGuideEditContext();
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>{edit.title || 'Untitled Guide'}</CardTitle>
			<CardDescription>{edit.description || 'No description yet'}</CardDescription>
		</CardHeader>
	</Card>

	<div class="max-w-none">
		{#if edit.editorContent && edit.editorContent.length > 0}
			<div class="prose dark:prose-invert max-w-none">
				<BlockRenderer content={edit.editorContent} />
			</div>
		{:else if edit.markdownContent && !edit.markdownContent.trim().startsWith('[')}
			{#key edit.markdownContent}
				<RenderMd content={edit.markdownContent} />
			{/key}
		{:else}
			<p class="text-muted-foreground">No content to preview</p>
		{/if}
	</div>
</div>
