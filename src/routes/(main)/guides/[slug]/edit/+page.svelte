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
		GetGuide,
		ListTags,
		submitGuideForApprovalCommand,
		updateGuideCommand,
	} from '$lib/remote/guides.remote';
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

	// UI state
	let isSaving = $state(false);
	let isSubmitting = $state(false);
	let isDeleting = $state(false);
	let showDeleteDialog = $state(false);
	let saveStatus = $state<'idle' | 'saving' | 'saved'>('idle');
	let saveError = $state<string | null>(null);
	let lastSavedSnapshot = $state('');
	let lastSaveTime = $state<Date | null>(null);

	// Auto-save timer
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let activeSave: Promise<boolean> | null = null;

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

	$effect(() => {
		guide.then((g) => {
			if (!g) return;
			if (guideId !== null) return;
			guideId = g.id;
			title = g.title;
			description = g.description;
			markdownContent = g.content;
			tags = (g.tagIds ?? []).map((id) => id.toString());
			skyblockIconId = g.iconSkyblockId || '';
			concurrencyVersion = g.concurrencyVersion || 1;

			// Try to detect if content is JSON blocks format
			if (g.content && g.content.trim().startsWith('[')) {
				try {
					const parsed = JSON.parse(g.content);
					if (Array.isArray(parsed)) {
						editorContent = parsed as RootNode;
					}
				} catch {
					// Not JSON, keep as markdown
				}
			}

			lastSavedSnapshot = getSaveSnapshot();
			hasLoadedGuide = true;
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

					{#if markdownContent}
						<Editor
							content={markdownContent}
							onChange={(blocks) => (editorContent = blocks)}
							class="min-h-125"
						/>
					{/if}
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
				<Button variant="destructive" onclick={() => (showDeleteDialog = true)} disabled={isDeleting}>
					Delete Guide
				</Button>

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
