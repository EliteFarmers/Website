<script lang="ts">
	import type { GuideAssetDto } from '$lib/guides/types';
	import { isImageAsset, isLitematicAsset } from '$lib/guides/types';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';
	import { Textarea } from '$ui/textarea';
	import Download from '@lucide/svelte/icons/download';
	import FileArchive from '@lucide/svelte/icons/file-archive';
	import ImageIcon from '@lucide/svelte/icons/image';
	import LinkIcon from '@lucide/svelte/icons/link';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Upload from '@lucide/svelte/icons/upload';
	import type { Editor } from '@tiptap/core';

	interface Props {
		open: boolean;
		editor: Editor | undefined;
		guideId?: number | null;
		assets?: GuideAssetDto[];
		onOpenChange: (open: boolean) => void;
		onAssetsChanged?: () => void;
	}

	let { open, editor, guideId, assets = [], onOpenChange, onAssetsChanged }: Props = $props();

	let title = $state('');
	let description = $state('');
	let imageUrl = $state('');
	let litematicDisplayName = $state('');
	let isWorking = $state(false);
	let errorMessage = $state('');
	let localAssets = $state<GuideAssetDto[]>([]);

	$effect(() => {
		localAssets = assets ?? [];
	});

	let imageAssets = $derived(localAssets.filter(isImageAsset));
	let litematicAssets = $derived(localAssets.filter(isLitematicAsset));

	function assetTitle(asset: GuideAssetDto) {
		return asset.image?.title || asset.litematic?.name || asset.fileName;
	}

	function appendAsset(asset: GuideAssetDto) {
		localAssets = [asset, ...localAssets.filter((item) => item.id !== asset.id)];
		onAssetsChanged?.();
	}

	async function parseAssetResponse(response: Response) {
		if (!response.ok) {
			const body = await response.json().catch(() => null);
			throw new Error(body?.message || body?.detail || 'Upload failed');
		}

		return (await response.json()) as GuideAssetDto;
	}

	async function uploadImageFile(file: File | null | undefined) {
		if (!guideId || !file) return;
		errorMessage = '';
		isWorking = true;

		try {
			const form = new FormData();
			form.set('Image', file);
			if (title.trim()) form.set('Title', title.trim());
			if (description.trim()) form.set('Description', description.trim());

			const asset = await parseAssetResponse(
				await fetch(`/api/guides/${guideId}/images/upload`, {
					method: 'POST',
					body: form,
				})
			);

			appendAsset(asset);
			insertImage(asset);
			title = '';
			description = '';
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
		} finally {
			isWorking = false;
		}
	}

	async function importImageUrl() {
		if (!guideId || !imageUrl.trim()) return;
		errorMessage = '';
		isWorking = true;

		try {
			const asset = await parseAssetResponse(
				await fetch(`/api/guides/${guideId}/images/import`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						url: imageUrl.trim(),
						title: title.trim() || null,
						description: description.trim() || null,
					}),
				})
			);

			appendAsset(asset);
			insertImage(asset);
			imageUrl = '';
			title = '';
			description = '';
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to import image';
		} finally {
			isWorking = false;
		}
	}

	async function uploadLitematic(file: File | null | undefined) {
		if (!guideId || !file) return;
		errorMessage = '';
		isWorking = true;

		try {
			const form = new FormData();
			form.set('File', file);
			if (litematicDisplayName.trim()) form.set('DisplayName', litematicDisplayName.trim());

			const asset = await parseAssetResponse(
				await fetch(`/api/guides/${guideId}/litematics`, {
					method: 'POST',
					body: form,
				})
			);

			appendAsset(asset);
			insertLitematic(asset);
			litematicDisplayName = '';
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to upload litematic';
		} finally {
			isWorking = false;
		}
	}

	async function deleteAsset(asset: GuideAssetDto) {
		if (!guideId) return;
		errorMessage = '';
		isWorking = true;

		try {
			const response = await fetch(`/api/guides/${guideId}/assets/${asset.id}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Failed to delete asset');
			}

			localAssets = localAssets.filter((item) => item.id !== asset.id);
			onAssetsChanged?.();
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to delete asset';
		} finally {
			isWorking = false;
		}
	}

	function insertImage(asset: GuideAssetDto) {
		if (!editor || !asset.image) return;

		editor
			.chain()
			.focus()
			.insertContent({
				type: 'image',
				attrs: {
					src: asset.image.url,
					alt: asset.image.title || asset.fileName,
					title: asset.image.description || undefined,
					width: asset.image.width,
					height: asset.image.height,
					assetId: asset.id,
					sources: asset.image.sources,
				},
			})
			.run();

		onOpenChange(false);
	}

	function insertLitematic(asset: GuideAssetDto) {
		if (!editor || !asset.litematic) return;

		editor
			.chain()
			.focus()
			.setLitematic({
				assetId: asset.id,
				fileName: asset.fileName,
				downloadUrl: asset.litematic.downloadUrl,
				name: asset.litematic.name,
				author: asset.litematic.author,
				width: asset.litematic.width,
				height: asset.litematic.height,
				length: asset.litematic.length,
				regionCount: asset.litematic.regionCount,
			})
			.run();

		onOpenChange(false);
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Guide Assets</Dialog.Title>
			<Dialog.Description>Upload or select hosted guide images and litematic schematics.</Dialog.Description>
		</Dialog.Header>

		{#if errorMessage}
			<div class="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm">
				{errorMessage}
			</div>
		{/if}

		<Tabs value="images" class="mt-4">
			<TabsList>
				<TabsTrigger value="images">Images</TabsTrigger>
				<TabsTrigger value="import">URL Import</TabsTrigger>
				<TabsTrigger value="litematics">Litematics</TabsTrigger>
			</TabsList>

			<TabsContent value="images" class="space-y-4">
				<div class="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
					<div>
						<Label for="asset-title">Title</Label>
						<Input id="asset-title" bind:value={title} placeholder="Optional title" />
					</div>
					<div>
						<Label for="asset-description">Description</Label>
						<Input id="asset-description" bind:value={description} placeholder="Optional alt text" />
					</div>
					<div class="flex items-end">
						<Label class="w-full">
							<span class="sr-only">Upload image</span>
							<Input
								type="file"
								accept="image/png,image/jpeg,image/webp,image/gif"
								class="hidden"
								disabled={isWorking || !guideId}
								onchange={(event) => uploadImageFile(event.currentTarget.files?.[0])}
							/>
							<Button type="button" disabled={isWorking || !guideId} class="w-full">
								<Upload class="mr-2 size-4" />
								Upload
							</Button>
						</Label>
					</div>
				</div>

				<div class="grid gap-3 sm:grid-cols-2">
					{#each imageAssets as asset (asset.id)}
						<div class="flex gap-3 rounded-md border p-3">
							<img
								src={asset.image?.url}
								alt={assetTitle(asset)}
								class="size-20 shrink-0 rounded-sm object-cover"
								loading="lazy"
							/>
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium">{assetTitle(asset)}</p>
								<p class="text-muted-foreground mt-1 text-xs">
									{asset.image?.width} x {asset.image?.height}
								</p>
								<div class="mt-3 flex gap-2">
									<Button size="sm" variant="outline" onclick={() => insertImage(asset)}>
										<ImageIcon class="mr-2 size-4" />
										Insert
									</Button>
									<Button
										size="icon"
										variant="ghost"
										disabled={isWorking}
										aria-label="Delete asset"
										onclick={() => deleteAsset(asset)}
									>
										<Trash2 class="size-4" />
									</Button>
								</div>
							</div>
						</div>
					{:else}
						<p class="text-muted-foreground rounded-md border border-dashed p-4 text-sm sm:col-span-2">
							No uploaded images yet.
						</p>
					{/each}
				</div>
			</TabsContent>

			<TabsContent value="import" class="space-y-4">
				<div class="grid gap-3">
					<div>
						<Label for="image-url">Image URL</Label>
						<Input id="image-url" bind:value={imageUrl} placeholder="https://example.com/image.png" />
					</div>
					<div class="grid gap-3 sm:grid-cols-2">
						<div>
							<Label for="import-title">Title</Label>
							<Input id="import-title" bind:value={title} placeholder="Optional title" />
						</div>
						<div>
							<Label for="import-description">Description</Label>
							<Textarea
								id="import-description"
								bind:value={description}
								rows={2}
								placeholder="Optional alt text"
							/>
						</div>
					</div>
					<Button onclick={importImageUrl} disabled={isWorking || !guideId || !imageUrl.trim()}>
						<LinkIcon class="mr-2 size-4" />
						Import and Insert
					</Button>
				</div>
			</TabsContent>

			<TabsContent value="litematics" class="space-y-4">
				<div class="grid gap-3 sm:grid-cols-[1fr_auto]">
					<div>
						<Label for="litematic-name">Display Name</Label>
						<Input id="litematic-name" bind:value={litematicDisplayName} placeholder="Optional name" />
					</div>
					<div class="flex items-end">
						<Label class="w-full">
							<span class="sr-only">Upload litematic</span>
							<Input
								type="file"
								accept=".litematic"
								class="hidden"
								disabled={isWorking || !guideId}
								onchange={(event) => uploadLitematic(event.currentTarget.files?.[0])}
							/>
							<Button type="button" disabled={isWorking || !guideId} class="w-full">
								<Upload class="mr-2 size-4" />
								Upload
							</Button>
						</Label>
					</div>
				</div>

				<div class="grid gap-3">
					{#each litematicAssets as asset (asset.id)}
						<div
							class="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
						>
							<div class="flex min-w-0 items-center gap-3">
								<FileArchive class="size-5 shrink-0" />
								<div class="min-w-0">
									<p class="truncate text-sm font-medium">{assetTitle(asset)}</p>
									<div class="text-muted-foreground mt-1 flex flex-wrap gap-2 text-xs">
										{#if asset.litematic?.width && asset.litematic.height && asset.litematic.length}
											<Badge variant="outline"
												>{asset.litematic.width} x {asset.litematic.height} x {asset.litematic
													.length}</Badge
											>
										{/if}
										<Badge variant="secondary">{asset.litematic?.regionCount ?? 0} regions</Badge>
									</div>
								</div>
							</div>
							<div class="flex gap-2">
								<a href={asset.litematic?.downloadUrl} download={asset.fileName}>
									<Button size="icon" variant="ghost" aria-label="Download litematic">
										<Download class="size-4" />
									</Button>
								</a>
								<Button size="sm" variant="outline" onclick={() => insertLitematic(asset)}
									>Insert</Button
								>
								<Button
									size="icon"
									variant="ghost"
									disabled={isWorking}
									aria-label="Delete asset"
									onclick={() => deleteAsset(asset)}
								>
									<Trash2 class="size-4" />
								</Button>
							</div>
						</div>
					{:else}
						<p class="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
							No litematic schematics yet.
						</p>
					{/each}
				</div>
			</TabsContent>
		</Tabs>
	</Dialog.Content>
</Dialog.Root>
