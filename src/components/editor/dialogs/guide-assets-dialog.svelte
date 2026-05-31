<script lang="ts">
	import { tiptapContentReferencesAsset } from '$lib/guides/assets';
	import { getLargestImageSourceUrl } from '$lib/guides/responsive-images';
	import type { GuideAssetDto } from '$lib/guides/types';
	import { isImageAsset, isLitematicAsset } from '$lib/guides/types';
	import { deleteGuideAssetCommand, uploadGuideImageForm, uploadGuideLitematicForm } from '$lib/remote/guides.remote';
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
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Upload from '@lucide/svelte/icons/upload';
	import type { Editor } from '@tiptap/core';
	import { tick } from 'svelte';

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
	let uploadStatus = $state('');
	let localAssets = $derived(assets ?? []);
	let imageFileInput = $state<HTMLInputElement | null>(null);
	let urlImageFileInput = $state<HTMLInputElement | null>(null);
	let litematicFileInput = $state<HTMLInputElement | null>(null);
	const imageUploadForm = uploadGuideImageForm.for('direct-image');
	const urlImageUploadForm = uploadGuideImageForm.for('url-image');
	const supportedImageTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

	let imageAssets = $derived(localAssets.filter(isImageAsset));
	let litematicAssets = $derived(localAssets.filter(isLitematicAsset));

	function handleOpenChange(next: boolean) {
		if (isWorking && !next) return;
		onOpenChange(next);
	}

	function assetTitle(asset: GuideAssetDto) {
		return asset.image?.title || asset.litematic?.name || asset.fileName;
	}

	function isAssetReferenced(assetId: string) {
		return editor ? tiptapContentReferencesAsset(editor.getJSON(), assetId) : false;
	}

	function appendAsset(asset: GuideAssetDto) {
		localAssets = [asset, ...localAssets.filter((item) => item.id !== asset.id)];
		onAssetsChanged?.();
	}

	function setInputFile(input: HTMLInputElement | null, file: File) {
		if (!input) return;

		const transfer = new DataTransfer();
		transfer.items.add(file);
		input.files = transfer.files;
	}

	function imageExtension(contentType: string) {
		switch (contentType) {
			case 'image/png':
				return '.png';
			case 'image/jpeg':
				return '.jpg';
			case 'image/webp':
				return '.webp';
			case 'image/gif':
				return '.gif';
			default:
				return '.img';
		}
	}

	function fileNameFromUrl(rawUrl: string, contentType: string) {
		let fileName = '';
		try {
			const pathName = new URL(rawUrl).pathname;
			fileName = decodeURIComponent(pathName.split('/').pop() ?? '');
		} catch {
			fileName = '';
		}

		fileName = fileName.replace(/[^a-zA-Z0-9._ -]/g, '-').replace(/^-+|-+$/g, '');
		if (!fileName) return `imported-image${imageExtension(contentType)}`;
		return /\.[a-zA-Z0-9]{2,8}$/.test(fileName) ? fileName : `${fileName}${imageExtension(contentType)}`;
	}

	async function fetchImageUrlAsFile(rawUrl: string) {
		let url: URL;
		try {
			url = new URL(rawUrl);
		} catch {
			throw new Error('Enter a valid image URL.');
		}

		if (url.protocol !== 'https:' && url.protocol !== 'http:') {
			throw new Error('Image URL must use HTTP or HTTPS.');
		}

		let response: Response;
		try {
			response = await fetch(url.toString(), { mode: 'cors' });
		} catch {
			throw new Error(
				'Could not fetch this image in your browser. The host may block cross-origin downloads. Try another host or upload the file directly.'
			);
		}

		if (!response.ok) {
			throw new Error(`Image host returned ${response.status}. Try another host or upload the file directly.`);
		}

		const headerContentType = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() ?? '';
		if (!supportedImageTypes.has(headerContentType)) {
			throw new Error('Only PNG, JPG, WebP, and GIF images can be imported from a URL.');
		}

		const blob = await response.blob();
		if (blob.size === 0) {
			throw new Error('The image download was empty.');
		}

		return new File([blob], fileNameFromUrl(url.toString(), headerContentType), { type: headerContentType });
	}

	async function uploadDroppedImage(event: DragEvent) {
		event.preventDefault();
		const file = event.dataTransfer?.files?.[0];
		if (!file) return;

		setInputFile(imageFileInput, file);
		await uploadImageFile(file);
	}

	async function uploadDroppedLitematic(event: DragEvent) {
		event.preventDefault();
		const file = event.dataTransfer?.files?.[0];
		if (!file) return;

		setInputFile(litematicFileInput, file);
		await uploadLitematic(file);
	}

	async function uploadImageFile(file: File | null | undefined) {
		if (!guideId || !file || isWorking) return;
		errorMessage = '';
		isWorking = true;
		uploadStatus = `Uploading ${file.name}...`;
		await tick();

		try {
			const submitted = await imageUploadForm.submit();
			const result = imageUploadForm.result;
			if (!submitted || result?.error || !result?.asset) {
				throw new Error(result?.error || 'Failed to upload image');
			}

			appendAsset(result.asset);
			insertImage(result.asset);
			title = '';
			description = '';
			if (imageFileInput) imageFileInput.value = '';
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
		} finally {
			isWorking = false;
			uploadStatus = '';
		}
	}

	async function importImageUrl() {
		if (!guideId || !imageUrl.trim() || isWorking) return;
		errorMessage = '';
		isWorking = true;
		uploadStatus = 'Downloading image...';
		await tick();

		try {
			const file = await fetchImageUrlAsFile(imageUrl.trim());
			setInputFile(urlImageFileInput, file);
			uploadStatus = `Uploading ${file.name}...`;
			await tick();

			const submitted = await urlImageUploadForm.submit();
			const result = urlImageUploadForm.result;
			if (!submitted || result?.error || !result?.asset) {
				throw new Error(result?.error || 'Failed to import image');
			}

			appendAsset(result.asset);
			insertImage(result.asset);
			imageUrl = '';
			title = '';
			description = '';
			if (urlImageFileInput) urlImageFileInput.value = '';
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to import image';
		} finally {
			isWorking = false;
			uploadStatus = '';
		}
	}

	async function uploadLitematic(file: File | null | undefined) {
		if (!guideId || !file || isWorking) return;
		errorMessage = '';
		isWorking = true;
		uploadStatus = `Uploading ${file.name}...`;
		await tick();

		try {
			const submitted = await uploadGuideLitematicForm.submit();
			const result = uploadGuideLitematicForm.result;
			if (!submitted || result?.error || !result?.asset) {
				throw new Error(result?.error || 'Failed to upload litematic');
			}

			appendAsset(result.asset);
			insertLitematic(result.asset);
			litematicDisplayName = '';
			if (litematicFileInput) litematicFileInput.value = '';
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to upload litematic';
		} finally {
			isWorking = false;
			uploadStatus = '';
		}
	}

	async function deleteAsset(asset: GuideAssetDto) {
		if (!guideId) return;
		errorMessage = '';

		if (isAssetReferenced(asset.id)) {
			errorMessage = 'Remove this asset from the guide content before deleting it.';
			return;
		}

		isWorking = true;

		try {
			const result = await deleteGuideAssetCommand({ guideId, assetId: asset.id });
			if (result.error) {
				throw new Error(result.error);
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
					src: getLargestImageSourceUrl(asset.image.sources) ?? asset.image.url,
					alt: asset.image.title || asset.fileName,
					title: asset.image.description || undefined,
					displaySize: 'natural',
					align: 'center',
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

<Dialog.Root {open} onOpenChange={handleOpenChange}>
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
				<form {...imageUploadForm} enctype="multipart/form-data" class="space-y-3">
					<input type="hidden" name="guideId" value={guideId ?? ''} />
					<div class="grid gap-3 sm:grid-cols-2">
						<div>
							<Label for="asset-title">Title</Label>
							<Input id="asset-title" name="title" bind:value={title} placeholder="Optional title" />
						</div>
						<div>
							<Label for="asset-description">Description</Label>
							<Input
								id="asset-description"
								name="description"
								bind:value={description}
								placeholder="Optional alt text"
							/>
						</div>
					</div>
					<Input
						bind:ref={imageFileInput}
						name="image"
						type="file"
						accept="image/png,image/jpeg,image/webp,image/gif"
						class="hidden"
						disabled={!guideId}
						onchange={(event) => uploadImageFile(event.currentTarget.files?.[0])}
					/>
					<div
						role="button"
						tabindex={0}
						aria-busy={isWorking}
						class="border-muted-foreground/30 bg-muted/20 hover:border-primary/50 flex flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center transition-colors data-[busy=true]:pointer-events-none data-[busy=true]:opacity-75"
						data-busy={isWorking}
						ondragover={(event) => event.preventDefault()}
						ondrop={uploadDroppedImage}
						onkeydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								if (!isWorking) imageFileInput?.click();
							}
						}}
						onclick={() => {
							if (!isWorking) imageFileInput?.click();
						}}
					>
						{#if isWorking}
							<Loader2 class="text-muted-foreground size-6 animate-spin" />
						{:else}
							<Upload class="text-muted-foreground size-6" />
						{/if}
						<div>
							<p class="text-sm font-medium">{uploadStatus || 'Drop an image here'}</p>
							<p class="text-muted-foreground text-xs">
								{isWorking ? 'Processing and inserting when ready' : 'PNG, JPG, WebP, or GIF'}
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							disabled={isWorking || !guideId}
							onclick={(event) => {
								event.stopPropagation();
								imageFileInput?.click();
							}}
						>
							{#if isWorking}
								<Loader2 class="mr-2 size-4 animate-spin" />
								Uploading
							{:else}
								<Upload class="mr-2 size-4" />
								Choose File
							{/if}
						</Button>
					</div>
				</form>

				<div class="grid gap-3 sm:grid-cols-2">
					{#each imageAssets as asset (asset.id)}
						{@const isReferenced = isAssetReferenced(asset.id)}
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
								{#if isReferenced}
									<Badge variant="secondary" class="mt-2">In use</Badge>
								{/if}
								<div class="mt-3 flex gap-2">
									<Button size="sm" variant="outline" onclick={() => insertImage(asset)}>
										<ImageIcon class="mr-2 size-4" />
										Insert
									</Button>
									<Button
										size="icon"
										variant="ghost"
										disabled={isWorking || isReferenced}
										title={isReferenced
											? 'Remove this asset from the guide content before deleting it.'
											: 'Delete asset'}
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
				<form {...urlImageUploadForm} enctype="multipart/form-data" class="grid gap-3">
					<input type="hidden" name="guideId" value={guideId ?? ''} />
					<Input
						bind:ref={urlImageFileInput}
						name="image"
						type="file"
						accept="image/png,image/jpeg,image/webp,image/gif"
						class="hidden"
						disabled={!guideId}
					/>
					<div>
						<Label for="image-url">Image URL</Label>
						<Input id="image-url" bind:value={imageUrl} placeholder="https://example.com/image.png" />
					</div>
					<div class="grid gap-3 sm:grid-cols-2">
						<div>
							<Label for="import-title">Title</Label>
							<Input id="import-title" name="title" bind:value={title} placeholder="Optional title" />
						</div>
						<div>
							<Label for="import-description">Description</Label>
							<Textarea
								id="import-description"
								name="description"
								bind:value={description}
								rows={2}
								placeholder="Optional alt text"
							/>
						</div>
					</div>
					<Button type="button" onclick={importImageUrl} disabled={isWorking || !guideId || !imageUrl.trim()}>
						{#if isWorking}
							<Loader2 class="mr-2 size-4 animate-spin" />
							{uploadStatus || 'Importing'}
						{:else}
							<LinkIcon class="mr-2 size-4" />
							Import and Insert
						{/if}
					</Button>
				</form>
			</TabsContent>

			<TabsContent value="litematics" class="space-y-4">
				<form {...uploadGuideLitematicForm} enctype="multipart/form-data" class="space-y-3">
					<input type="hidden" name="guideId" value={guideId ?? ''} />
					<div>
						<Label for="litematic-name">Display Name</Label>
						<Input
							id="litematic-name"
							name="displayName"
							bind:value={litematicDisplayName}
							placeholder="Optional name"
						/>
					</div>
					<Input
						bind:ref={litematicFileInput}
						name="file"
						type="file"
						accept=".litematic"
						class="hidden"
						disabled={!guideId}
						onchange={(event) => uploadLitematic(event.currentTarget.files?.[0])}
					/>
					<div
						role="button"
						tabindex={0}
						aria-busy={isWorking}
						class="border-muted-foreground/30 bg-muted/20 hover:border-primary/50 flex flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center transition-colors data-[busy=true]:pointer-events-none data-[busy=true]:opacity-75"
						data-busy={isWorking}
						ondragover={(event) => event.preventDefault()}
						ondrop={uploadDroppedLitematic}
						onkeydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								if (!isWorking) litematicFileInput?.click();
							}
						}}
						onclick={() => {
							if (!isWorking) litematicFileInput?.click();
						}}
					>
						{#if isWorking}
							<Loader2 class="text-muted-foreground size-6 animate-spin" />
						{:else}
							<FileArchive class="text-muted-foreground size-6" />
						{/if}
						<div>
							<p class="text-sm font-medium">{uploadStatus || 'Drop a litematic here'}</p>
							<p class="text-muted-foreground text-xs">
								{isWorking ? 'Validating and inserting when ready' : 'Litematica schematic files'}
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							disabled={isWorking || !guideId}
							onclick={(event) => {
								event.stopPropagation();
								litematicFileInput?.click();
							}}
						>
							{#if isWorking}
								<Loader2 class="mr-2 size-4 animate-spin" />
								Uploading
							{:else}
								<Upload class="mr-2 size-4" />
								Choose File
							{/if}
						</Button>
					</div>
				</form>

				<div class="grid gap-3">
					{#each litematicAssets as asset (asset.id)}
						{@const isReferenced = isAssetReferenced(asset.id)}
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
										{#if isReferenced}
											<Badge variant="secondary">In use</Badge>
										{/if}
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
									disabled={isWorking || isReferenced}
									title={isReferenced
										? 'Remove this asset from the guide content before deleting it.'
										: 'Delete asset'}
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
