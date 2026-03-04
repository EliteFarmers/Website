<script lang="ts">
	import {
		GetPendingComments,
		GetPendingGuides,
		ListAdminTags,
		approveCommentCommand,
		approveGuideCommand,
		createTagCommand,
		deleteTagCommand,
		rejectGuideCommand,
		updateTagCommand,
	} from '$lib/remote/admin-guides.remote';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogHeader,
		AlertDialogTitle,
	} from '$ui/alert-dialog';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$ui/card';
	import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$ui/table';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';
	import { Textarea } from '$ui/textarea';
	import Check from '@lucide/svelte/icons/check';
	// import { formatDistanceToNow } from 'date-fns';

	const pendingGuides = GetPendingGuides();
	const pendingComments = GetPendingComments();
	const tags = ListAdminTags();

	// State for rejection dialog
	let rejectionDialogOpen = $state(false);
	let selectedGuideId: number | null = $state(null);
	let rejectionReason = $state('');
	let isRejectingGuide = $state(false);
	let isApprovingGuide = $state(false);

	// State for comment management
	let approvingCommentId: number | null = $state(null);
	let showNewTagDialog = $state(false);
	let editingTagId: number | null = $state(null);
	let tagName = $state('');
	let tagCategory = $state('');
	let tagColor = $state('#000000'); // Default color
	let isCreatingTag = $state(false);
	let isUpdatingTag = $state(false);
	let isDeletingTag = $state(false);
	let showDeleteConfirm = $state(false);

	function notifyError(message: string) {
		console.error(message);
	}

	function notifySuccess(message: string) {
		console.info(message);
	}

	async function handleApproveGuide(guideId: number) {
		isApprovingGuide = true;

		try {
			const result = await approveGuideCommand(guideId);

			if (result.error) {
				notifyError(result.error);
				return;
			}

			notifySuccess('Guide approved and published!');
		} catch (err) {
			notifyError('Failed to approve guide');
			console.error(err);
		} finally {
			isApprovingGuide = false;
		}
	}

	async function handleRejectGuide() {
		if (!selectedGuideId || !rejectionReason.trim()) {
			notifyError('Please provide a rejection reason');
			return;
		}

		isRejectingGuide = true;

		try {
			const result = await rejectGuideCommand({
				guideId: selectedGuideId,
				reason: rejectionReason.trim(),
			});

			if (result.error) {
				notifyError(result.error);
				return;
			}

			notifySuccess('Guide rejected');
			rejectionDialogOpen = false;
			selectedGuideId = null;
			rejectionReason = '';
		} catch (err) {
			notifyError('Failed to reject guide');
			console.error(err);
		} finally {
			isRejectingGuide = false;
		}
	}

	async function handleApproveComment(commentId: number) {
		approvingCommentId = commentId;

		try {
			const result = await approveCommentCommand(commentId).updates(
				pendingComments.withOverride((current) => (current ?? []).filter((c) => c.id !== commentId))
			);

			if (result.error) {
				notifyError(result.error);
				return;
			}

			notifySuccess('Comment approved!');
		} catch (err) {
			notifyError('Failed to approve comment');
			console.error(err);
		} finally {
			approvingCommentId = null;
		}
	}

	async function handleCreateTag() {
		if (!tagName.trim() || !tagCategory.trim()) {
			notifyError('Please fill in all required fields');
			return;
		}

		isCreatingTag = true;

		try {
			const result = await createTagCommand({
				name: tagName.trim(),
				category: tagCategory.trim(),
				color: tagColor,
			});

			if (result.error) {
				notifyError(result.error);
				return;
			}

			notifySuccess('Tag created!');
			showNewTagDialog = false;
			tagName = '';
			tagCategory = '';
			tagColor = '#000000';
		} catch (err) {
			notifyError('Failed to create tag');
			console.error(err);
		} finally {
			isCreatingTag = false;
		}
	}

	async function handleUpdateTag() {
		if (!editingTagId || !tagName.trim() || !tagCategory.trim()) {
			notifyError('Please fill in all required fields');
			return;
		}

		isUpdatingTag = true;

		try {
			const result = await updateTagCommand({
				id: editingTagId,
				name: tagName.trim(),
				category: tagCategory.trim(),
				color: tagColor,
			});

			if (result.error) {
				notifyError(result.error);
				return;
			}

			notifySuccess('Tag updated!');
			editingTagId = null;
			tagName = '';
			tagCategory = '';
			tagColor = '#000000';
		} catch (err) {
			notifyError('Failed to update tag');
			console.error(err);
		} finally {
			isUpdatingTag = false;
		}
	}

	async function handleDeleteTag(tagId: number) {
		isDeletingTag = true;

		try {
			const result = await deleteTagCommand(tagId);

			if (result.error) {
				notifyError(result.error);
				return;
			}

			notifySuccess('Tag deleted!');
			showDeleteConfirm = false;
			editingTagId = null;
		} catch (err) {
			notifyError('Failed to delete tag');
			console.error(err);
		} finally {
			isDeletingTag = false;
		}
	}

	function startEditTag(tag: { id: number; name: string; category: string; hexColor: string }) {
		editingTagId = tag.id;
		tagName = tag.name;
		tagCategory = tag.category;
		tagColor = tag.hexColor;
		showNewTagDialog = true;
	}
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-3xl font-bold">Guide Moderation</h1>
		<p class="text-muted-foreground mt-1">Review and manage community guides</p>
	</div>

	<Tabs value="pending" class="w-full">
		<TabsList>
			<TabsTrigger value="pending">Pending Guides</TabsTrigger>
			<TabsTrigger value="comments">Comments</TabsTrigger>
			<TabsTrigger value="tags">Tag Management</TabsTrigger>
		</TabsList>

		<TabsContent value="pending" class="space-y-4">
			{#await pendingGuides}
				<div class="space-y-4">
					{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
						<div class="bg-muted h-24 animate-pulse rounded-lg"></div>
					{/each}
				</div>
			{:then guides}
				{#if !guides || guides.length === 0}
					<Card>
						<CardContent class="pt-6 text-center">
							<p class="text-muted-foreground">No pending guides to review</p>
						</CardContent>
					</Card>
				{:else}
					<div class="space-y-4">
						{#each guides as guide (guide.id)}
							<Card>
								<CardHeader>
									<div class="flex items-start justify-between gap-4">
										<div class="flex-1">
											<div class="mb-2 flex items-center gap-2">
												<CardTitle class="text-lg">{guide.title}</CardTitle>
												<Badge>Pending Review</Badge>
											</div>
											<p class="text-muted-foreground mt-2 text-sm">
												Slug: {guide.slug}
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent class="flex justify-end gap-2">
									<a href="/guides/{guide.slug}?draft=true">
										<Button variant="outline">Preview</Button>
									</a>
									<Button
										variant="outline"
										onclick={() => {
											selectedGuideId = guide.id;
											rejectionDialogOpen = true;
										}}
										class="text-destructive"
									>
										Reject
									</Button>
									<Button onclick={() => handleApproveGuide(guide.id)} disabled={isApprovingGuide}>
										{#if isApprovingGuide}
											Approving...
										{:else}
											Approve
										{/if}
									</Button>
								</CardContent>
							</Card>
						{/each}
					</div>
				{/if}
			{:catch}
				<Card>
					<CardContent class="pt-6 text-center">
						<p class="text-destructive">Failed to load pending guides</p>
						<Button onclick={() => pendingGuides.refresh()} class="mt-4" variant="outline">Retry</Button>
					</CardContent>
				</Card>
			{/await}
		</TabsContent>

		<TabsContent value="comments" class="space-y-4">
			{#await pendingComments}
				<div class="space-y-4">
					{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
						<div class="bg-muted h-24 animate-pulse rounded-lg"></div>
					{/each}
				</div>
			{:then comments}
				{@const list = comments ?? []}
				{#if list.length === 0}
					<Card>
						<CardContent class="pt-6 text-center">
							<p class="text-muted-foreground">No pending comments to review</p>
						</CardContent>
					</Card>
				{:else}
					<div class="space-y-3">
						{#each list as comment (comment.id)}
							<Card>
								<CardHeader>
									<div class="flex items-start justify-between gap-4">
										<div class="min-w-0">
											<CardTitle class="text-base">{comment.author.name}</CardTitle>
											<p class="text-muted-foreground mt-1 text-xs">
												{new Date(comment.createdAt).toLocaleString()}
											</p>
											<p class="text-muted-foreground mt-1 text-xs">
												Guide: <a
													class="hover:text-foreground underline"
													href="/guides/{comment.sqid}">{comment.sqid}</a
												>
											</p>
										</div>
										<Button
											size="sm"
											onclick={() => handleApproveComment(comment.id)}
											disabled={approvingCommentId === comment.id}
										>
											{#if approvingCommentId === comment.id}
												Approving...
											{:else}
												<Check class="mr-2 h-4 w-4" />
												Approve
											{/if}
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									<p class="text-sm whitespace-pre-wrap">{comment.draftContent || comment.content}</p>
								</CardContent>
							</Card>
						{/each}
					</div>
				{/if}
			{:catch}
				<Card>
					<CardContent class="pt-6 text-center">
						<p class="text-destructive">Failed to load pending comments</p>
						<Button onclick={() => pendingComments.refresh()} class="mt-4" variant="outline">Retry</Button>
					</CardContent>
				</Card>
			{/await}
		</TabsContent>

		<TabsContent value="tags" class="space-y-4">
			<div class="flex justify-end">
				<Button onclick={() => (showNewTagDialog = true)}>Create New Tag</Button>
			</div>

			{#await tags}
				<div class="space-y-2">
					{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
						<div class="bg-muted h-12 animate-pulse rounded-lg"></div>
					{/each}
				</div>
			{:then tagList}
				{#if !tagList || tagList.length === 0}
					<Card>
						<CardContent class="pt-6 text-center">
							<p class="text-muted-foreground mb-4">No tags created yet</p>
							<Button onclick={() => (showNewTagDialog = true)}>Create First Tag</Button>
						</CardContent>
					</Card>
				{:else}
					<Card>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Color</TableHead>
									<TableHead class="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each tagList as tag (tag.id)}
									<TableRow>
										<TableCell class="font-semibold">{tag.name}</TableCell>
										<TableCell>{tag.category}</TableCell>
										<TableCell>
											<div class="flex items-center gap-2">
												<div
													class="h-6 w-6 rounded border"
													style="background-color: {tag.hexColor}"
												></div>
												<span class="font-mono text-xs">{tag.hexColor}</span>
											</div>
										</TableCell>
										<TableCell class="text-right">
											<div class="flex justify-end gap-2">
												<Button size="sm" variant="outline" onclick={() => startEditTag(tag)}>
													Edit
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onclick={() => {
														editingTagId = tag.id;
														showDeleteConfirm = true;
													}}
												>
													Delete
												</Button>
											</div>
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</Card>
				{/if}
			{:catch}
				<Card>
					<CardContent class="pt-6 text-center">
						<p class="text-destructive">Failed to load tags</p>
						<Button onclick={() => tags.refresh()} class="mt-4" variant="outline">Retry</Button>
					</CardContent>
				</Card>
			{/await}
		</TabsContent>
	</Tabs>
</div>

<Dialog open={rejectionDialogOpen} onOpenChange={(open: boolean) => (rejectionDialogOpen = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Reject Guide</DialogTitle>
			<DialogDescription
				>Provide a reason for rejecting this guide. The author will see this message.</DialogDescription
			>
		</DialogHeader>
		<div class="flex flex-col gap-4">
			<Textarea
				placeholder="Rejection reason..."
				value={rejectionReason}
				onchange={(e) => (rejectionReason = e.currentTarget.value)}
				rows={4}
			/>
			<div class="flex justify-end gap-2">
				<Button variant="outline" onclick={() => (rejectionDialogOpen = false)} disabled={isRejectingGuide}>
					Cancel
				</Button>
				<Button
					onclick={handleRejectGuide}
					disabled={isRejectingGuide || !rejectionReason.trim()}
					class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				>
					{#if isRejectingGuide}
						Rejecting...
					{:else}
						Reject
					{/if}
				</Button>
			</div>
		</div>
	</DialogContent>
</Dialog>

<Dialog open={showNewTagDialog} onOpenChange={(open: boolean) => (showNewTagDialog = open)}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>{editingTagId ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
		</DialogHeader>
		<div class="flex flex-col gap-4">
			<div>
				<label for="tag-name" class="text-sm font-semibold">Name</label>
				<Input
					id="tag-name"
					placeholder="e.g., Farming Tips"
					value={tagName}
					onchange={(e) => (tagName = e.currentTarget.value)}
					class="mt-1"
				/>
			</div>
			<div>
				<label for="tag-category" class="text-sm font-semibold">Category</label>
				<Input
					id="tag-category"
					placeholder="e.g., Farming"
					value={tagCategory}
					onchange={(e) => (tagCategory = e.currentTarget.value)}
					class="mt-1"
				/>
			</div>
			<div>
				<label for="tag-color" class="text-sm font-semibold">Color</label>
				<div class="mt-1 flex items-center gap-2">
					<input
						id="tag-color"
						type="color"
						value={tagColor}
						onchange={(e) => (tagColor = e.currentTarget.value)}
						class="border-input h-10 w-16 cursor-pointer rounded border"
					/>
					<span class="font-mono text-sm">{tagColor}</span>
				</div>
			</div>
			<div class="flex justify-end gap-2">
				<Button
					variant="outline"
					onclick={() => {
						showNewTagDialog = false;
						editingTagId = null;
						tagName = '';
						tagCategory = '';
						tagColor = '#000000';
					}}
					disabled={isCreatingTag || isUpdatingTag}
				>
					Cancel
				</Button>
				{#if editingTagId}
					<Button
						variant="destructive"
						onclick={() => (showDeleteConfirm = true)}
						disabled={isUpdatingTag || isDeletingTag}
					>
						Delete
					</Button>
				{/if}
				<Button
					onclick={editingTagId ? handleUpdateTag : handleCreateTag}
					disabled={isCreatingTag || isUpdatingTag || !tagName.trim() || !tagCategory.trim()}
				>
					{#if isCreatingTag || isUpdatingTag}
						{editingTagId ? 'Updating...' : 'Creating...'}
					{:else}
						{editingTagId ? 'Update' : 'Create'}
					{/if}
				</Button>
			</div>
		</div>
	</DialogContent>
</Dialog>

<AlertDialog open={showDeleteConfirm} onOpenChange={(open: boolean) => (showDeleteConfirm = open)}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Delete Tag</AlertDialogTitle>
			<AlertDialogDescription>
				Are you sure you want to delete this tag? This action cannot be undone.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<div class="flex justify-end gap-3">
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction
				onclick={() => handleDeleteTag(editingTagId!)}
				disabled={isDeletingTag}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
			>
				{#if isDeletingTag}
					Deleting...
				{:else}
					Delete
				{/if}
			</AlertDialogAction>
		</div>
	</AlertDialogContent>
</AlertDialog>
