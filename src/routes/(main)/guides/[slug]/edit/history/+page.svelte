<script lang="ts">
	import { getGuideEditContext } from '$lib/guides/edit-state.svelte';
	import { GetGuideHistory } from '$lib/remote/guides.remote';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$ui/card';
	import Eye from '@lucide/svelte/icons/eye';
	import History from '@lucide/svelte/icons/history';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	const edit = getGuideEditContext();
	const guideId = edit.requireGuideId();
	const historyPromise = $derived(GetGuideHistory(guideId));
	const versions = $derived(await historyPromise);
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>Edit History</CardTitle>
			<CardDescription>Every save creates a revision that can be restored into the current draft.</CardDescription
			>
		</CardHeader>
		<CardContent class="space-y-3">
			{#if edit.historyError}
				<p class="text-destructive text-sm">{edit.historyError}</p>
			{/if}
			{#each versions as version (version.id)}
				<div class="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
					<div class="min-w-0">
						<div class="flex items-center gap-2">
							<History class="size-4" />
							<p class="font-medium">Revision {version.revisionNumber}</p>
							{#if version.isPublished}
								<Badge variant="secondary">Published</Badge>
							{/if}
						</div>
						<p class="text-muted-foreground mt-1 truncate text-sm">{version.title}</p>
						<p class="text-muted-foreground text-xs">{new Date(version.createdAt).toLocaleString()}</p>
					</div>
					<div class="flex shrink-0 gap-2">
						<Button variant="outline" size="sm" onclick={() => (edit.previewVersion = version)}>
							<Eye class="mr-2 size-4" />
							Preview
						</Button>
						<Button variant="outline" size="sm" onclick={() => edit.handleRestoreVersion(version)}>
							<RotateCcw class="mr-2 size-4" />
							Restore
						</Button>
					</div>
				</div>
			{:else}
				<p class="text-muted-foreground rounded-md border border-dashed p-4 text-sm">No saved revisions yet.</p>
			{/each}
		</CardContent>
	</Card>
</div>
