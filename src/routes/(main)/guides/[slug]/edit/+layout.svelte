<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BlockRenderer from '$comp/blocks/block-renderer.svelte';
	import RenderMd from '$comp/markdown/render-md.svelte';
	import { GuideEditState, setGuideEditContext } from '$lib/guides/edit-state.svelte';
	import type { FullGuideWithAuthors } from '$lib/guides/types';
	import { GetGuide } from '$lib/remote/guides.remote';
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
	import * as Dialog from '$ui/dialog';
	import { Separator } from '$ui/separator';
	import { Tabs, TabsList, TabsTrigger } from '$ui/tabs';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	const slug = page.params.slug as string;
	const guideQuery = GetGuide({ slug, draft: true });
	const edit = setGuideEditContext(new GuideEditState(slug));
	const loadResult = await guideQuery
		.then((guide) => ({ guide: guide as FullGuideWithAuthors, error: null }))
		.catch((err) => ({
			guide: undefined,
			error: err instanceof Error ? err : new Error('Please try again later'),
		}));
	const initialGuide = loadResult.guide;
	const loadError = loadResult.error;
	if (initialGuide) {
		edit.loadGuideIntoState(initialGuide);
	}

	const activeTab = $derived.by(() => {
		const pathname = page.url.pathname.replace(/\/$/, '');
		if (pathname.endsWith('/assets')) return 'assets';
		if (pathname.endsWith('/history')) return 'history';
		if (pathname.endsWith('/authors')) return 'authors';
		if (pathname.endsWith('/preview')) return 'preview';
		return 'edit';
	});

	function tabPath(tab: string) {
		return tab === 'edit' ? edit.basePath : `${edit.basePath}/${tab}`;
	}
</script>

{#if loadError}
	<div class="flex flex-col items-center justify-center gap-4 py-16">
		<div class="text-destructive text-lg font-semibold">Failed to load guide</div>
		<p class="text-muted-foreground">{loadError.message || 'Please try again later'}</p>
		<a href="/guides">
			<Button>Back to Guides</Button>
		</a>
	</div>
{:else if initialGuide}
	<div class="mt-16 flex flex-col gap-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">Edit Guide</h1>
				<p class="text-muted-foreground mt-1">
					{#if edit.saveError}
						<span class="text-destructive">{edit.saveError}</span>
					{:else if edit.saveStatus === 'saving'}
						Saving...
					{:else if edit.lastSaveTime}
						Saved {edit.lastSaveTime.toLocaleTimeString()}
					{/if}
				</p>
			</div>
			<div class="flex gap-2">
				<Button variant="outline" onclick={() => goto('/guides')}>Cancel</Button>
				<Button onclick={() => edit.handleSave()} disabled={edit.isSaving}>
					{#if edit.isSaving}
						Saving...
					{:else}
						Save Draft
					{/if}
				</Button>
			</div>
		</div>

		<Separator />

		<Tabs value={activeTab} class="w-full">
			<TabsList>
				<TabsTrigger value="edit" onclick={() => goto(tabPath('edit'))}>Edit</TabsTrigger>
				<TabsTrigger value="assets" onclick={() => goto(tabPath('assets'))}>Assets</TabsTrigger>
				<TabsTrigger value="history" onclick={() => goto(tabPath('history'))}>History</TabsTrigger>
				<TabsTrigger value="authors" onclick={() => goto(tabPath('authors'))}>Authors</TabsTrigger>
				<TabsTrigger value="preview" onclick={() => goto(tabPath('preview'))}>Preview</TabsTrigger>
			</TabsList>
		</Tabs>

		{@render children?.()}

		<Separator />

		<div class="flex items-center justify-between">
			{#if edit.canManageGuide}
				<Button variant="destructive" onclick={() => (edit.showDeleteDialog = true)} disabled={edit.isDeleting}>
					Delete Guide
				</Button>
			{:else}
				<div></div>
			{/if}

			<div class="flex gap-2">
				<Button variant="outline" onclick={() => edit.handleSave()} disabled={edit.isSaving}>
					{#if edit.isSaving}
						Saving...
					{:else}
						Save Draft
					{/if}
				</Button>
				{#if edit.guideData?.status === 'PendingApproval'}
					<div class="flex items-center justify-center gap-2 rounded-md border px-3">Pending Approval</div>
				{:else}
					<Button
						onclick={() => (edit.showSubmitDialog = true)}
						disabled={edit.isSubmitting ||
							!edit.title.trim() ||
							!edit.description.trim() ||
							edit.guideData?.status === 'PendingApproval'}
					>
						Submit for Approval
					</Button>
				{/if}
			</div>
		</div>
	</div>

	<Dialog.Root
		open={edit.previewVersion !== null}
		onOpenChange={(open: boolean) => {
			if (!open) edit.previewVersion = null;
		}}
	>
		<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
			{#if edit.previewVersion}
				<Dialog.Header>
					<Dialog.Title>Revision {edit.previewVersion.revisionNumber}</Dialog.Title>
					<Dialog.Description>
						{edit.previewVersion.title} saved {new Date(edit.previewVersion.createdAt).toLocaleString()}
					</Dialog.Description>
				</Dialog.Header>

				<div class="mt-4 space-y-4">
					<div class="rounded-md border p-3">
						<p class="font-medium">{edit.previewVersion.title}</p>
						<p class="text-muted-foreground mt-1 text-sm">{edit.previewVersion.description}</p>
					</div>

					<div class="max-h-[60vh] overflow-y-auto rounded-md border p-4">
						{#if edit.previewBlocks && edit.previewBlocks.length > 0}
							<div class="prose dark:prose-invert max-w-none">
								<BlockRenderer content={edit.previewBlocks} />
							</div>
						{:else if edit.previewVersion.content && !edit.previewVersion.content.trim().startsWith('[')}
							{#key edit.previewVersion.id}
								<RenderMd content={edit.previewVersion.content} />
							{/key}
						{:else}
							<p class="text-muted-foreground">No content to preview</p>
						{/if}
					</div>
				</div>

				<Dialog.Footer>
					<Button variant="outline" onclick={() => (edit.previewVersion = null)}>Close</Button>
					<Button
						onclick={() => {
							const version = edit.previewVersion;
							edit.previewVersion = null;
							if (version) void edit.handleRestoreVersion(version);
						}}
					>
						<RotateCcw class="mr-2 size-4" />
						Restore Revision
					</Button>
				</Dialog.Footer>
			{/if}
		</Dialog.Content>
	</Dialog.Root>

	<AlertDialog open={edit.showDeleteDialog} onOpenChange={(open: boolean) => (edit.showDeleteDialog = open)}>
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
					onclick={() => edit.handleDelete()}
					disabled={edit.isDeleting}
					class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				>
					{#if edit.isDeleting}
						Deleting...
					{:else}
						Delete
					{/if}
				</AlertDialogAction>
			</div>
		</AlertDialogContent>
	</AlertDialog>

	<AlertDialog open={edit.showSubmitDialog} onOpenChange={(open: boolean) => (edit.showSubmitDialog = open)}>
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>Submit Guide for Review</AlertDialogTitle>
				<AlertDialogDescription>
					Make sure this guide is ready to be published. Staff may approve it as-is if it meets the guide
					rules.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<div class="text-muted-foreground space-y-2 text-sm">
				<p>Before submitting, check that:</p>
				<ul class="list-disc space-y-1 pl-5">
					<li>The title, description, and guide content are complete.</li>
					<li>Images and litematic files are relevant and display correctly.</li>
					<li>Any claims, prices, rates, and requirements are accurate.</li>
				</ul>
				<p>
					If your guide is rejected, you can view the feedback from staff and make necessary changes before
					submitting again.
				</p>
				<p>Thank you for contributing to the community!</p>
			</div>
			<div class="flex justify-end gap-3">
				<AlertDialogCancel disabled={edit.isSubmitting}>Keep Editing</AlertDialogCancel>
				<Button onclick={() => edit.handleSubmitForApproval()} disabled={edit.isSubmitting}>
					{#if edit.isSubmitting}
						Submitting...
					{:else}
						Submit for Review
					{/if}
				</Button>
			</div>
		</AlertDialogContent>
	</AlertDialog>
{/if}
