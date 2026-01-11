<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BlockRenderer from '$comp/blocks/block-renderer.svelte';
	import type { BlockNode, InlineNode } from '$comp/blocks/blocks';
	import { CommentSectionContainer } from '$comp/comments';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import RenderHtml from '$comp/markdown/render-html.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import type { FullGuideDto, GuideDto } from '$lib/api/schemas';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { GetGuideComments } from '$lib/remote/comments.remote';
	import {
		GetGuide,
		bookmarkGuideCommand,
		deleteGuideCommand,
		unbookmarkGuideCommand,
		unpublishGuideCommand,
		voteGuideCommand,
	} from '$lib/remote/guides.remote';
	import { getHtmlFromMarkdown } from '$lib/remote/md.remote';
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
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { Separator } from '$ui/separator';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import Eye from '@lucide/svelte/icons/eye';
	import Link from '@lucide/svelte/icons/link';
	import Star from '@lucide/svelte/icons/star';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import { formatDistanceToNow } from 'date-fns';
	import { useDebounce } from 'runed';

	function notifyError(message: string) {
		console.error(message);
	}

	function notifySuccess(message: string) {
		console.info(message);
	}

	const slug = page.params.slug as string;
	const draft = page.url.searchParams.get('draft') === 'true';

	// Load guide and comments
	const guidePromise = GetGuide({ slug, draft });
	const commentsPromise = GetGuideComments(slug);

	const gbl = getGlobalContext();
	let isOwner = $derived(guidePromise.current?.author?.id === gbl.session?.id);

	// Component state
	let userVote = $state<number | null>(null);
	let isBookmarked = $state(false);
	let pendingGuideVote: 0 | 1 | -1 | null = null;
	let pendingGuideVoteGuideId: number | null = null;
	let showDeleteDialog = $state(false);
	let showUnpublishDialog = $state(false);
	let isLoadingDelete = $state(false);
	let isLoadingUnpublish = $state(false);

	const flushGuideVote = useDebounce(async () => {
		if (pendingGuideVoteGuideId === null || pendingGuideVote === null) return;

		const guideId = pendingGuideVoteGuideId;
		const value = pendingGuideVote;
		pendingGuideVoteGuideId = null;
		pendingGuideVote = null;

		const result = await voteGuideCommand({ guideId, value });
		if (result.error) {
			notifyError(result.error);
			guidePromise.refresh();
		}
	}, 400);

	$effect(() => {
		const guide = guidePromise.current as FullGuideDto | undefined;
		if (!guide) return;
		userVote = guide.userVote ?? null;
		isBookmarked = !!guide.isBookmarked;
	});

	function buildTableOfContents(html: string): Array<{ level: number; text: string; id: string }> {
		if (!html) return [];
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const headings = doc.querySelectorAll('h1, h2, h3');
		const toc: Array<{ level: number; text: string; id: string }> = [];

		headings.forEach((heading, index) => {
			const level = parseInt(heading.tagName[1]);
			const text = heading.textContent || '';
			const id = `heading-${index}`;
			heading.id = id;
			toc.push({ level, text, id });
		});

		return toc;
	}

	function getTextFromInlineNodes(nodes: InlineNode[]): string {
		return nodes
			.map((node) => {
				if (node.type === 'text') return node.text;
				if (node.type === 'link') return getTextFromInlineNodes(node.children);
				return '';
			})
			.join('');
	}

	function buildTableOfContentsFromBlocks(blocks: BlockNode[]): Array<{ level: number; text: string; id: string }> {
		const toc: Array<{ level: number; text: string; id: string }> = [];
		blocks.forEach((block, index) => {
			if (block.type === 'heading') {
				const text = getTextFromInlineNodes(block.children);
				toc.push({
					level: block.level,
					text,
					id: `heading-${index}`,
				});
			}
		});
		return toc;
	}

	async function handleVote(guideId: number, value: 1 | -1) {
		if (!page.data.session) {
			notifyError('Please log in to vote');
			return;
		}

		const oldVote = userVote ?? 0;
		const nextVote: 0 | 1 | -1 = oldVote === value ? 0 : value;
		const delta = nextVote - oldVote;
		userVote = nextVote;

		guidePromise.withOverride((current) => {
			if (!current || current.id !== guideId) return current;
			return {
				...current,
				score: current.score + delta,
				userVote: nextVote,
			};
		});

		pendingGuideVote = nextVote;
		pendingGuideVoteGuideId = guideId;
		flushGuideVote();
	}

	async function handleBookmark(guideId: number) {
		if (!page.data.session) {
			notifyError('Please log in to bookmark');
			return;
		}

		const oldBookmarked = isBookmarked;
		const nextBookmarked = !oldBookmarked;
		isBookmarked = nextBookmarked;

		const cmd = nextBookmarked ? bookmarkGuideCommand : unbookmarkGuideCommand;
		const result = await cmd(guideId).updates(
			guidePromise.withOverride((current) => {
				if (!current) return current;
				return { ...current, isBookmarked: nextBookmarked };
			})
		);

		if (result.error) {
			isBookmarked = oldBookmarked;
			notifyError(result.error);
			return;
		}

		notifySuccess(nextBookmarked ? 'Guide bookmarked' : 'Bookmark removed');
	}

	async function handleDeleteGuide(guideId: number) {
		isLoadingDelete = true;

		try {
			const result = await deleteGuideCommand(guideId);

			if (result.error) {
				notifyError(result.error);
				return;
			}

			notifySuccess('Guide deleted');
			window.location.href = '/guides';
		} catch (err) {
			notifyError('Failed to delete guide');
			console.error(err);
		} finally {
			isLoadingDelete = false;
		}
	}

	async function handleUnpublishGuide(guideId: number) {
		isLoadingUnpublish = true;

		try {
			const result = await unpublishGuideCommand(guideId);

			if (result.error) {
				notifyError(result.error);
				return;
			}

			notifySuccess('Guide unpublished and reverted to draft');
			window.location.href = '/guides';
		} catch (err) {
			notifyError('Failed to unpublish guide');
			console.error(err);
		} finally {
			isLoadingUnpublish = false;
		}
	}

	let ign = $derived.by(() => {
		const guide = guidePromise.current as GuideDto | undefined;
		if (!guide) return '';
		const split = guide.author.name.split(' ');
		return split.length === 1 ? split[0] : split.sort((a, b) => b.length - a.length)[0];
	});
</script>

{#await guidePromise then guide}
	{#if !guide}
		<div class="flex flex-col items-center justify-center gap-4 py-16">
			<div class="text-destructive text-lg font-semibold">Guide not found</div>
			<p class="text-muted-foreground">The guide you're looking for doesn't exist or has been deleted.</p>
			<a href="/guides">
				<Button>Back to Guides</Button>
			</a>
		</div>
	{:else}
		<div class="flex flex-col gap-6">
			{#if guide.isDraft && guide.rejectionReason}
				<div class="bg-destructive/10 border-destructive my-4 rounded-lg border p-4">
					<p class="text-destructive font-semibold">Rejection Notice</p>
					<p class="mt-1 text-sm">{guide.rejectionReason}</p>
				</div>
			{/if}

			{#if guide.isDraft}
				<div class="bg-muted/50 border-border my-4 rounded-lg border p-4">
					<p class="font-semibold">You are viewing a draft version</p>
					<p class="text-muted-foreground mt-1 text-sm">This guide is not visible to the public.</p>
					{#if page.data.session?.perms.admin}
						<div class="mt-3 flex gap-2">
							<a href="/guides/{guide.slug}/edit">
								<Button size="sm" variant="outline">Edit</Button>
							</a>
						</div>
					{/if}
				</div>
			{/if}

			<div class="flex flex-col items-center gap-6 py-10 text-center">
				<div class="flex max-w-3xl flex-col gap-4">
					<div class="relative flex items-start justify-center gap-4">
						<h1 class="text-4xl font-bold">{guide.title}</h1>
					</div>
					<p class="text-muted-foreground text-lg">{guide.description}</p>
				</div>

				<div class="flex flex-col items-center gap-4">
					<div class="text-muted-foreground flex items-center gap-3 text-sm">
						<div class="text-foreground flex items-center gap-2 font-medium">
							{#if guide.author.avatar}
								<UserIcon
									user={{ id: guide.author.id.toString(), avatar: guide.author.avatar }}
									class="size-6 rounded-full"
								/>
							{:else}
								<PlayerHead uuid={ign} class="size-6" />
							{/if}
							<span>{guide.author.name}</span>
						</div>
						<span>•</span>
						<span>{formatDistanceToNow(new Date(guide.createdAt), { addSuffix: true })}</span>
						<span>•</span>
						<span class="flex items-center gap-1">
							<Eye class="h-3 w-3" />
							{guide.viewCount}
						</span>
					</div>

					<div class="flex flex-wrap items-center justify-center gap-2">
						{#each guide.tags as tag (tag)}
							<Badge variant="secondary">{tag}</Badge>
						{/each}
					</div>

					<div class="mt-2 flex items-center gap-2">
						<div class="bg-card flex items-center rounded-lg border">
							<Button
								variant={userVote === 1 ? 'default' : 'ghost'}
								size="sm"
								onclick={() => handleVote(guide.id, 1)}
								class="rounded-none rounded-l-md border-r px-3"
							>
								<ThumbsUp class="mr-2 h-4 w-4" />
								Like
							</Button>
							<span class="min-w-8 px-3 py-1 text-center text-sm font-semibold"
								>{guide.score.toLocaleString()}</span
							>
							<Button
								variant={userVote === -1 ? 'default' : 'ghost'}
								size="sm"
								onclick={() => handleVote(guide.id, -1)}
								class="rounded-none rounded-r-md border-l px-3"
							>
								<ThumbsDown class="h-4 w-4" />
							</Button>
						</div>

						<Button
							variant={isBookmarked ? 'default' : 'outline'}
							size="sm"
							onclick={() => handleBookmark(guide.id)}
						>
							<Star class="mr-2 h-4 w-4" />
							Bookmark
						</Button>

						<Button
							variant="outline"
							size="sm"
							onclick={() => navigator.clipboard.writeText(window.location.href)}
						>
							<Link class="mr-2 h-4 w-4" />
							Share
						</Button>

						{#if gbl.session?.perms.admin || isOwner}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									<Button variant="outline" size="sm" aria-label="Open menu">
										<Ellipsis class="h-4 w-4" />
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end">
									{#if gbl.session?.perms.admin}
										<DropdownMenu.Item onclick={() => (showUnpublishDialog = true)}>
											Unpublish
										</DropdownMenu.Item>
									{/if}
									<DropdownMenu.Item onclick={() => goto(`/guides/${guide.slug}/edit`)}>
										Edit
									</DropdownMenu.Item>
									<DropdownMenu.Item
										onclick={() => (showDeleteDialog = true)}
										class="text-destructive"
									>
										Delete
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						{/if}
					</div>
				</div>
			</div>

			<Separator />

			<div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
				<div class="lg:col-span-3">
					{#if guide.content.trim().startsWith('[') || guide.content.trim().startsWith('{')}
						{#key guide.content}
							{@const parsed = (() => {
								try {
									const p = JSON.parse(guide.content);
									return Array.isArray(p) ? p : null;
								} catch {
									return null;
								}
							})()}
							{#if parsed}
								<div class="prose dark:prose-invert mb-8 max-w-none">
									<BlockRenderer content={parsed} />
								</div>
							{:else}
								<div class="prose dark:prose-invert mb-8 max-w-none">
									{#await getHtmlFromMarkdown(guide.content) then html}
										<RenderHtml content={html} />
									{/await}
								</div>
							{/if}
						{/key}
					{:else}
						<div class="prose dark:prose-invert mb-8 max-w-none">
							{#await getHtmlFromMarkdown(guide.content) then html}
								<RenderHtml content={html} />
							{/await}
						</div>
					{/if}

					<Separator class="my-8" />

					<CommentSectionContainer
						guideId={guide.id}
						{commentsPromise}
						session={page.data.session}
						{notifyError}
						{notifySuccess}
					/>
				</div>

				<div class="hidden lg:block">
					{#if guide.content.trim().startsWith('[') || guide.content.trim().startsWith('{')}
						{#key guide.content}
							{@const parsed = (() => {
								try {
									const p = JSON.parse(guide.content);
									return Array.isArray(p) ? p : null;
								} catch {
									return null;
								}
							})()}
							{#if parsed}
								{@const toc = buildTableOfContentsFromBlocks(parsed)}
								{#if toc.length > 0}
									<div class="sticky top-4">
										<h3 class="mb-3 text-sm font-semibold">Table of Contents</h3>
										<nav class="flex flex-col gap-1 text-sm">
											{#each toc as item (item.id)}
												<a
													href="#{item.id}"
													class="text-muted-foreground hover:text-foreground transition-colors"
													style="padding-left: {(item.level - 1) * 1}rem"
												>
													{item.text}
												</a>
											{/each}
										</nav>
									</div>
								{/if}
							{:else}
								{#await getHtmlFromMarkdown(guide.content) then html}
									{@const toc = buildTableOfContents(html)}
									{#if toc.length > 0}
										<div class="sticky top-4">
											<h3 class="mb-3 text-sm font-semibold">Table of Contents</h3>
											<nav class="flex flex-col gap-1 text-sm">
												{#each toc as item (item.id)}
													<a
														href="#{item.id}"
														class="text-muted-foreground hover:text-foreground transition-colors"
														style="padding-left: {(item.level - 1) * 1}rem"
													>
														{item.text}
													</a>
												{/each}
											</nav>
										</div>
									{/if}
								{/await}
							{/if}
						{/key}
					{:else}
						{#await getHtmlFromMarkdown(guide.content) then html}
							{@const toc = buildTableOfContents(html)}
							{#if toc.length > 0}
								<div class="sticky top-4">
									<h3 class="mb-3 text-sm font-semibold">Table of Contents</h3>
									<nav class="flex flex-col gap-1 text-sm">
										{#each toc as item (item.id)}
											<a
												href="#{item.id}"
												class="text-muted-foreground hover:text-foreground transition-colors"
												style="padding-left: {(item.level - 1) * 1}rem"
											>
												{item.text}
											</a>
										{/each}
									</nav>
								</div>
							{/if}
						{/await}
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
						onclick={() => handleDeleteGuide(guide.id)}
						disabled={isLoadingDelete}
						class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{#if isLoadingDelete}
							Deleting...
						{:else}
							Delete
						{/if}
					</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</AlertDialog>

		<AlertDialog open={showUnpublishDialog} onOpenChange={(open: boolean) => (showUnpublishDialog = open)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Unpublish Guide</AlertDialogTitle>
					<AlertDialogDescription>
						This will revert the guide to draft status. It will no longer be visible to the public.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div class="flex justify-end gap-3">
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onclick={() => handleUnpublishGuide(guide.id)}
						disabled={isLoadingUnpublish}
						class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{#if isLoadingUnpublish}
							Unpublishing...
						{:else}
							Unpublish
						{/if}
					</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	{/if}
{:catch error}
	<div class="flex flex-col items-center justify-center gap-4 py-16">
		<div class="text-destructive text-lg font-semibold">Guide not found</div>
		<p class="text-muted-foreground">
			{error?.message ?? "The guide you're looking for doesn't exist or has been deleted."}
		</p>
		<a href="/guides">
			<Button>Back to Guides</Button>
		</a>
	</div>
{/await}
