<script lang="ts">
	import type { LitematicProps } from '../blocks';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import Download from '@lucide/svelte/icons/download';
	import FileArchive from '@lucide/svelte/icons/file-archive';

	const { node }: LitematicProps = $props();

	let dimensions = $derived.by(() => {
		if (!node.width || !node.height || !node.length) return null;
		return `${node.width} x ${node.height} x ${node.length}`;
	});
</script>

<div class="not-prose bg-muted/20 my-4 rounded-md border p-4">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex min-w-0 items-start gap-3">
			<div class="bg-background mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md border">
				<FileArchive class="size-5" />
			</div>
			<div class="min-w-0">
				<p class="truncate font-semibold">{node.name || node.fileName}</p>
				<div class="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
					{#if node.author}
						<span>{node.author}</span>
					{/if}
					{#if dimensions}
						<Badge variant="outline">{dimensions}</Badge>
					{/if}
					<Badge variant="secondary">{node.regionCount} {node.regionCount === 1 ? 'region' : 'regions'}</Badge
					>
				</div>
			</div>
		</div>
		<a href={node.downloadUrl} download={node.fileName}>
			<Button variant="outline" size="sm">
				<Download class="mr-2 size-4" />
				Download
			</Button>
		</a>
	</div>
</div>
