<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BlockRenderer from '$comp/blocks/block-renderer.svelte';
	import type { RootNode } from '$comp/blocks/blocks';
	import Editor from '$comp/editor/Editor.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import RenderMd from '$comp/markdown/render-md.svelte';
	import {
		deleteGuideCommand,
		GetGuideAssets,
		GetGuideHistory,
		GetGuide,
		ListTags,
		replaceGuideAuthorsCommand,
		restoreGuideVersionCommand,
		submitGuideForApprovalCommand,
		updateGuideCommand,
	} from '$lib/remote/guides.remote';
	import type { FullGuideWithAuthors, GuideAssetDto, GuideAuthorDto, GuideVersionDto } from '$lib/guides/types';
	import { isImageAsset, isLitematicAsset } from '$lib/guides/types';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogHeader,
		AlertDialogTitle,
	} from '$ui/alert-dialog';
	import { Button } from '$ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$ui/card';
	import { Input } from '$ui/input';
	import MultiSelect from '$ui/multi-select/multi-select.svelte';
	import { Separator } from '$ui/separator';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';
	import { Textarea } from '$ui/textarea';
	import { Badge } from '$ui/badge';
	import FileArchive from '@lucide/svelte/icons/file-archive';
	import ImageIcon from '@lucide/svelte/icons/image';
	import History from '@lucide/svelte/icons/history';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	function notifyError(message: string) {
		console.error(message);
	}

	function notifySuccess(message: string) {
		console.info(message);
	}

	const slug = page.params.slug as string;
	const guide = GetGuide({ slug, draft: true });
	const availableTagsQuery = ListTags();

	// Form state
	let title = $state('');
	let description = $state('');
	let markdownContent = $state('');
	let editorContent = $state<RootNode | null>(null);
	let skyblockIconId = $state('');
	let tags = $state<string[]>([]);
	let guideId = $state<number | null>(null);
	let concurrencyVersion = $state(1);
	let hasLoadedGuide = $state(false);
	let ownerId = $state('');
	let editorIdsText = $state('');

	// UI state
	let isSaving = $state(false);
	let isSubmitting = $state(false);
	let isDeleting = $state(false);
	let showDeleteDialog = $state(false);
	let isSavingAuthors = $state(false);
	let authorError = $state<string | null>(null);
	let historyError = $state<string | null>(null);
	let saveStatus = $state<'idle' | 'saving' | 'saved'>('idle');
	let saveError = $state<string | null>(null);
	let lastSavedSnapshot = $state('');
	let lastSaveTime = $state<Date | null>(null);

	// Auto-save timer
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let activeSave: Promise<boolean> | null = null;

	const guideData = $derived(guide.current as FullGuideWithAuthors | undefined);
	const assetsQuery = $derived(guideId ? GetGuideAssets(guideId) : null);
	const historyQuery = $derived(guideId ? GetGuideHistory(guideId) : null);
	const guideAssets = $derived((assetsQuery?.current ?? guideData?.assets ?? []) as GuideAssetDto[]);
	const guideAuthors = $derived.by((): GuideAuthorDto[] => {
		if (!guideData) return [];
		return guideData.authors?.length
			? guideData.authors
			: [{ author: guideData.author, isOwner: true, role: 'Owner' }];
	});
	const ownerAuthor = $derived(guideAuthors.find((author) => author.isOwner) ?? guideAuthors[0]);
	const canManageGuide = $derived(
		Boolean(page.data.session?.perms.admin || ownerAuthor?.author.id === page.data.session?.id)
	);

	function getContentToSave() {
		return editorContent ? JSON.stringify(editorContent) : markdownContent;
	}

	function getSaveSnapshot() {
		return JSON.stringify({
			title,
			description,
			markdownContent: getContentToSave(),
			iconSkyblockId: skyblockIconId.trim(),
			tags: [...tags],
		});
	}

	function clearPendingSave() {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
			saveTimeout = null;
		}
	}

	function loadGuideIntoState(g: FullGuideWithAuthors, force = false) {
		if (!force && guideId !== null) return;
		guideId = g.id;
		title = g.title;
		description = g.description;
		markdownContent = g.content;
		tags = (g.tagIds ?? []).map((id) => id.toString());
		skyblockIconId = g.iconSkyblockId || '';
		concurrencyVersion = g.concurrencyVersion || 1;
		loadEditorContent(g.content);
		const authorList = g.authors?.length ? g.authors : [{ author: g.author, isOwner: true, role: 'Owner' }];
		ownerId = authorList.find((author) => author.isOwner)?.author.id ?? g.author.id;
		editorIdsText = authorList
			.filter((author) => !author.isOwner)
			.map((author) => author.author.id)
			.join('\n');

		lastSavedSnapshot = getSaveSnapshot();
		hasLoadedGuide = true;
	}

	function loadEditorContent(content: string) {
		editorContent = null;
		if (content && content.trim().startsWith('[')) {
			try {
				const parsed = JSON.parse(content);
				if (Array.isArray(parsed)) {
					editorContent = parsed as RootNode;
				}
			} catch {
				// Not JSON, keep as markdown.
			}
		}
	}

	$effect(() => {
		guide.then((g) => {
			if (!g) return;
			loadGuideIntoState(g as FullGuideWithAuthors);
		});
	});

	// Auto-save effect
	$effect(() => {
		const snapshot = getSaveSnapshot();
		if (!hasLoadedGuide || snapshot === lastSavedSnapshot) {
			return;
		}
		if (!title.trim() || !description.trim()) {
			return;
		}

		clearPendingSave();
		saveStatus = 'saving';
		saveError = null;
		saveTimeout = setTimeout(() => {
			saveTimeout = null;
			void saveCurrentDraft();
		}, 3000);

		return clearPendingSave;
	});

	async function handleSave() {
		return await saveLatestDraft();
	}

	async function saveLatestDraft() {
		clearPendingSave();

		if (!title.trim() || !description.trim()) {
			saveError = 'Title and description are required';
			notifyError(saveError);
			return false;
		}
		if (!guideId) {
			saveError = 'Guide not loaded yet';
			notifyError(saveError);
			return false;
		}

		while (getSaveSnapshot() !== lastSavedSnapshot) {
			const saved = await saveCurrentDraft();
			if (!saved) return false;
		}

		saveStatus = 'saved';
		return true;
	}

	async function saveCurrentDraft() {
		if (activeSave) {
			return await activeSave;
		}

		activeSave = performSave();
		try {
			return await activeSave;
		} finally {
			activeSave = null;
		}
	}

	async function performSave() {
		if (!guideId) {
			saveError = 'Guide not loaded yet';
			notifyError(saveError);
			return false;
		}

		const snapshotToSave = getSaveSnapshot();
		const contentToSave = getContentToSave();

		isSaving = true;
		saveStatus = 'saving';
		saveError = null;

		try {
			const result = await updateGuideCommand({
				id: guideId,
				title,
				description,
				markdownContent: contentToSave,
				iconSkyblockId: skyblockIconId.trim(),
				tags: [...tags],
				concurrency: concurrencyVersion,
			});

			if (result.error) {
				saveError = result.error;
				saveStatus = 'idle';
				notifyError(result.error);
				return false;
			}

			markdownContent = contentToSave;
			concurrencyVersion = result.version || concurrencyVersion;
			lastSavedSnapshot = snapshotToSave;

			saveStatus = 'saved';
			lastSaveTime = new Date();
			notifySuccess('Guide saved');

			setTimeout(() => {
				if (getSaveSnapshot() === lastSavedSnapshot) {
					saveStatus = 'idle';
				}
			}, 2000);

			return true;
		} catch (err) {
			saveError = 'Failed to save guide';
			saveStatus = 'idle';
			notifyError(saveError);
			console.error(err);
			return false;
		} finally {
			isSaving = false;
		}
	}

	async function handleSubmitForApproval() {
		const contentHasValue = editorContent ? editorContent.length > 0 : markdownContent.trim().length > 0;
		if (!title.trim() || !description.trim() || !contentHasValue) {
			notifyError('Please fill in all fields before submitting');
			return;
		}
		if (!guideId) {
			notifyError('Guide not loaded yet');
			return;
		}

		isSubmitting = true;

		try {
			const saved = await saveLatestDraft();
			if (!saved) {
				return;
			}

			const result = await submitGuideForApprovalCommand(guideId);

			if (result.error) {
				console.error(result);
				notifyError(result.error);
				return;
			}

			notifySuccess('Guide submitted for approval!');

			// Refresh the guide data
			if (page.params.slug) {
				guide.refresh();
			}

			await goto('/profile/guides');
		} catch (err) {
			notifyError('Failed to submit guide');
			console.error(err);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDelete() {
		if (!guideId) {
			notifyError('Guide not loaded yet');
			return;
		}
		isDeleting = true;

		try {
			const result = await deleteGuideCommand(guideId);

			if (result.error) {
				notifyError(result.error);
				return;
			}

			notifySuccess('Guide deleted');
			await goto('/guides');
		} catch (err) {
			notifyError('Failed to delete guide');
			console.error(err);
		} finally {
			isDeleting = false;
		}
	}

	function parseEditorIds() {
		return editorIdsText
			.split(/[\s,]+/)
			.map((id) => id.trim())
			.filter(Boolean);
	}

	async function handleSaveAuthors() {
		if (!guideId) return;
		authorError = null;
		isSavingAuthors = true;

		try {
			const result = await replaceGuideAuthorsCommand({
				guideId,
				ownerId: ownerId.trim(),
				editorIds: parseEditorIds(),
			});

			if (result.error) {
				authorError = result.error;
				notifyError(result.error);
				return;
			}

			await guide.refresh();
			notifySuccess('Guide authors updated');
		} finally {
			isSavingAuthors = false;
		}
	}

	async function handleRestoreVersion(version: GuideVersionDto) {
		if (!guideId) return;
		historyError = null;

		try {
			const result = await restoreGuideVersionCommand({ guideId, versionId: version.id });
			if (result.error) {
				historyError = result.error;
				notifyError(result.error);
				return;
			}

			title = version.title;
			description = version.description;
			markdownContent = version.content;
			loadEditorContent(version.content);
			concurrencyVersion = result.version ?? version.concurrencyVersion;
			lastSavedSnapshot = getSaveSnapshot();
			lastSaveTime = new Date();
			await historyQuery?.refresh();
			notifySuccess('Guide revision restored');
		} catch (err) {
			historyError = 'Failed to restore guide revision';
			notifyError(historyError);
			console.error(err);
		}
	}

	async function deleteAsset(asset: GuideAssetDto) {
		if (!guideId) return;
		const response = await fetch(`/api/guides/${guideId}/assets/${asset.id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			notifyError('Failed to delete asset');
			return;
		}

		await assetsQuery?.refresh();
		notifySuccess('Asset deleted');
	}
</script>

{#await guide then g}
	{#if !g}
		<div class="flex flex-col items-center justify-center gap-4 py-16">
			<div class="text-destructive text-lg font-semibold">Failed to load guide</div>
			<a href="/guides">
				<Button>Back to Guides</Button>
			</a>
		</div>
	{:else}
		<div class="mt-16 flex flex-col gap-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold">Edit Guide</h1>
					<p class="text-muted-foreground mt-1">
						{#if saveError}
							<span class="text-destructive">{saveError}</span>
						{:else if saveStatus === 'saving'}
							Saving...
						{:else if lastSaveTime}
							Saved {lastSaveTime.toLocaleTimeString()}
						{/if}
					</p>
				</div>
				<div class="flex gap-2">
					<Button variant="outline" onclick={() => goto('/guides')}>Cancel</Button>
					<Button onclick={handleSave} disabled={isSaving}>
						{#if isSaving}
							Saving...
						{:else}
							Save Draft
						{/if}
					</Button>
				</div>
			</div>

			<Separator />

			<Tabs value="edit" class="w-full">
				<TabsList>
					<TabsTrigger value="edit">Edit</TabsTrigger>
					<TabsTrigger value="assets">Assets</TabsTrigger>
					<TabsTrigger value="history">History</TabsTrigger>
					<TabsTrigger value="authors">Authors</TabsTrigger>
					<TabsTrigger value="preview">Preview</TabsTrigger>
				</TabsList>

				<TabsContent value="edit" class="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Guide Details</CardTitle>
							<CardDescription>Basic information about your guide</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<div>
								<label for="title" class="text-sm font-semibold">Title</label>
								<Input id="title" placeholder="Guide title" bind:value={title} class="mt-1" />
							</div>

							<div>
								<label for="description" class="text-sm font-semibold">Description</label>
								<Textarea
									id="description"
									placeholder="Brief summary of your guide"
									bind:value={description}
									rows={2}
									class="mt-1"
								/>
							</div>

							<div>
								<label for="skyblock-icon" class="text-sm font-semibold"
									>Skyblock Icon ID (Optional)</label
								>
								<div class="flex flex-row items-center gap-1">
									<ItemRender skyblockId={skyblockIconId || 'STONE'} class="size-8" />
									<Input
										id="skyblock-icon"
										placeholder="ex: WHEAT, SEEDS, DIAMOND_BLOCK, etc."
										bind:value={skyblockIconId}
										oninput={(e) => (skyblockIconId = e.currentTarget.value.toUpperCase())}
										class="mt-1"
									/>
								</div>

								<p class="text-muted-foreground mt-1 text-xs">
									The Skyblock item ID to display as the guide icon
								</p>
							</div>

							<div class="flex flex-col gap-1">
								<label for="tags" class="text-sm font-semibold">Tags</label>
								{#await availableTagsQuery}
									<div class="bg-muted h-10 w-full animate-pulse rounded-md"></div>
								{:then availableTags}
									{@const options = availableTags.map((t) => ({
										label: t.name,
										value: t.id.toString(),
									}))}
									<MultiSelect
										{options}
										bind:value={tags}
										placeholder="Select tags..."
										class="mt-1"
									/>
								{:catch}
									<p class="text-destructive text-xs">Failed to load tags</p>
								{/await}
							</div>
						</CardContent>
					</Card>

					{#if hasLoadedGuide}
						<Editor
							content={markdownContent}
							onChange={(blocks) => (editorContent = blocks)}
							class="min-h-125"
							{guideId}
							assets={guideAssets}
							onAssetsChanged={() => assetsQuery?.refresh()}
						/>
					{/if}
				</TabsContent>

				<TabsContent value="assets" class="space-y-6">
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
													onclick={() => deleteAsset(asset)}
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
													<Badge variant="outline"
														>{asset.image?.width} x {asset.image?.height}</Badge
													>
												{:else if isLitematicAsset(asset)}
													<Badge variant="secondary">
														<FileArchive class="size-3" />
														Litematic
													</Badge>
													<Badge variant="outline"
														>{asset.litematic?.regionCount ?? 0} regions</Badge
													>
												{/if}
											</div>
										</div>
									</div>
								{:else}
									<p
										class="text-muted-foreground rounded-md border border-dashed p-4 text-sm sm:col-span-2"
									>
										No uploaded assets yet. Use the asset button in the editor toolbar to upload
										images or litematics.
									</p>
								{/each}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="history" class="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Edit History</CardTitle>
							<CardDescription
								>Every save creates a revision that can be restored into the current draft.</CardDescription
							>
						</CardHeader>
						<CardContent class="space-y-3">
							{#if historyError}
								<p class="text-destructive text-sm">{historyError}</p>
							{/if}
							{#if historyQuery}
								{#await historyQuery then versions}
									{#each versions as version (version.id)}
										<div
											class="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
										>
											<div class="min-w-0">
												<div class="flex items-center gap-2">
													<History class="size-4" />
													<p class="font-medium">Revision {version.revisionNumber}</p>
													{#if version.isPublished}
														<Badge variant="secondary">Published</Badge>
													{/if}
												</div>
												<p class="text-muted-foreground mt-1 truncate text-sm">
													{version.title}
												</p>
												<p class="text-muted-foreground text-xs">
													{new Date(version.createdAt).toLocaleString()}
												</p>
											</div>
											<Button
												variant="outline"
												size="sm"
												onclick={() => handleRestoreVersion(version)}>Restore</Button
											>
										</div>
									{:else}
										<p class="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
											No saved revisions yet.
										</p>
									{/each}
								{:catch}
									<p class="text-destructive text-sm">Failed to load guide history</p>
								{/await}
							{/if}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="authors" class="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Guide Authors</CardTitle>
							<CardDescription
								>Guides can have up to four visible authors. Editors can save and submit drafts.</CardDescription
							>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="grid gap-2">
								{#each guideAuthors as author (author.author.id)}
									<div class="flex items-center justify-between rounded-md border p-3">
										<div>
											<p class="font-medium">{author.author.name}</p>
											<p class="text-muted-foreground text-xs">{author.author.id}</p>
										</div>
										<Badge variant={author.isOwner ? 'default' : 'secondary'}
											>{author.isOwner ? 'Owner' : 'Editor'}</Badge
										>
									</div>
								{/each}
							</div>

							{#if canManageGuide}
								<Separator />
								<div class="grid gap-4">
									<div>
										<label for="owner-id" class="text-sm font-semibold">Owner Account ID</label>
										<Input id="owner-id" bind:value={ownerId} class="mt-1" />
									</div>
									<div>
										<label for="editor-ids" class="text-sm font-semibold">Editor Account IDs</label>
										<Textarea
											id="editor-ids"
											bind:value={editorIdsText}
											rows={4}
											placeholder="One account ID per line, max 3 editors"
											class="mt-1"
										/>
									</div>
									{#if authorError}
										<p class="text-destructive text-sm">{authorError}</p>
									{/if}
									<Button onclick={handleSaveAuthors} disabled={isSavingAuthors || !ownerId.trim()}>
										{isSavingAuthors ? 'Saving...' : 'Save Authors'}
									</Button>
								</div>
							{:else}
								<p class="text-muted-foreground text-sm">
									Only the guide owner or an admin can change authors.
								</p>
							{/if}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="preview" class="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>{title || 'Untitled Guide'}</CardTitle>
							<CardDescription>{description || 'No description yet'}</CardDescription>
						</CardHeader>
					</Card>

					<div class="max-w-none">
						{#if editorContent && editorContent.length > 0}
							<div class="prose dark:prose-invert max-w-none">
								<BlockRenderer content={editorContent} />
							</div>
						{:else if markdownContent && !markdownContent.trim().startsWith('[')}
							{#key markdownContent}
								<RenderMd content={markdownContent} />
							{/key}
						{:else}
							<p class="text-muted-foreground">No content to preview</p>
						{/if}
					</div>
				</TabsContent>
			</Tabs>

			<Separator />

			<div class="flex items-center justify-between">
				{#if canManageGuide}
					<Button variant="destructive" onclick={() => (showDeleteDialog = true)} disabled={isDeleting}>
						Delete Guide
					</Button>
				{:else}
					<div></div>
				{/if}

				<div class="flex gap-2">
					<Button variant="outline" onclick={handleSave} disabled={isSaving}>
						{#if isSaving}
							Saving...
						{:else}
							Save Draft
						{/if}
					</Button>
					{#if guide.current?.status === 'PendingApproval'}
						<div class="flex items-center justify-center gap-2 rounded-md border">Pending Approval</div>
					{:else}
						<Button
							onclick={handleSubmitForApproval}
							disabled={isSubmitting ||
								!title.trim() ||
								!description.trim() ||
								guide.current?.status === 'PendingApproval'}
						>
							Submit for Approval
						</Button>
					{/if}
				</div>
			</div>
		</div>

		<AlertDialog open={showDeleteDialog} onOpenChange={(open: boolean) => (showDeleteDialog = open)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Guide</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete this guide? This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div class="flex justify-end gap-3">
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onclick={handleDelete}
						disabled={isDeleting}
						class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{#if isDeleting}
							Deleting...
						{:else}
							Delete
						{/if}
					</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	{/if}
{:catch error}
	<div class="flex flex-col items-center justify-center gap-4 py-16">
		<div class="text-destructive text-lg font-semibold">Failed to load guide</div>
		<p class="text-muted-foreground">{error?.message || 'Please try again later'}</p>
		<a href="/guides">
			<Button>Back to Guides</Button>
		</a>
	</div>
{/await}
