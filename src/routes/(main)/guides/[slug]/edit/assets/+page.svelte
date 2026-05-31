<script lang="ts">
	import { getGuideEditContext } from '$lib/guides/edit-state.svelte';
	import { isImageAsset, isLitematicAsset } from '$lib/guides/types';
	import { GetGuideAssets } from '$lib/remote/guides.remote';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$ui/card';
	import FileArchive from '@lucide/svelte/icons/file-archive';
	import ImageIcon from '@lucide/svelte/icons/image';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	const edit = getGuideEditContext();
	const guideId = edit.requireGuideId();
	const assetsPromise = $derived(GetGuideAssets(guideId));
	const guideAssets = $derived(await assetsPromise);
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>Uploaded Assets</CardTitle>
			<CardDescription
				>Images are rehosted and resized. Litematic files are validated before storage.</CardDescription
			>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-3 sm:grid-cols-2">
				{#each guideAssets as asset (asset.id)}
					{@const assetReferenced = edit.isAssetReferenced(asset.id)}
					<div class="flex gap-3 rounded-md border p-3">
						<div
							class="bg-muted flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md"
						>
							{#if isImageAsset(asset)}
								<img
									src={asset.image?.url}
									alt={asset.image?.title || asset.fileName}
									class="h-full w-full object-cover"
									loading="lazy"
								/>
							{:else}
								<FileArchive class="size-6" />
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-start justify-between gap-2">
								<div class="min-w-0">
									<p class="truncate text-sm font-medium">
										{asset.image?.title || asset.litematic?.name || asset.fileName}
									</p>
									<p class="text-muted-foreground mt-1 text-xs">{asset.fileName}</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Delete asset"
									disabled={assetReferenced}
									title={assetReferenced
										? 'Remove this asset from the guide content before deleting it.'
										: 'Delete asset'}
									onclick={() => edit.deleteAsset(asset)}
								>
									<Trash2 class="size-4" />
								</Button>
							</div>
							<div class="mt-2 flex flex-wrap gap-2">
								{#if isImageAsset(asset)}
									<Badge variant="secondary">
										<ImageIcon class="size-3" />
										Image
									</Badge>
									<Badge variant="outline">{asset.image?.width} x {asset.image?.height}</Badge>
								{:else if isLitematicAsset(asset)}
									<Badge variant="secondary">
										<FileArchive class="size-3" />
										Litematic
									</Badge>
									<Badge variant="outline">{asset.litematic?.regionCount ?? 0} regions</Badge>
								{/if}
								{#if assetReferenced}
									<Badge variant="secondary">In use</Badge>
								{/if}
							</div>
						</div>
					</div>
				{:else}
					<p class="text-muted-foreground rounded-md border border-dashed p-4 text-sm sm:col-span-2">
						No uploaded assets yet. Use the asset button in the editor toolbar to upload images or
						litematics.
					</p>
				{/each}
			</div>
		</CardContent>
	</Card>
</div>
