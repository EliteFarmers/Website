<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BlockRenderer from '$comp/blocks/block-renderer.svelte';
	import type { BlockNode, RootNode } from '$comp/blocks/blocks';
	import { CommentSectionContainer } from '$comp/comments';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import RenderHtml from '$comp/markdown/render-html.svelte';
	import ContentReportDialog from '$comp/reports/content-report-dialog.svelte';
	import Head from '$comp/seo/head.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import DateDisplay from '$comp/time/date-display.svelte';
	import { trackAnalytics } from '$lib/analytics';
	import type { FullGuideDto } from '$lib/api/schemas';
	import { collectGuideHoistTargets, ensureGuideBlockIds, getTextFromInlineNodes } from '$lib/guides/block-ids';
	import type { CommentWithGuideAuthor, FullGuideWithAuthors, GuideAuthorDto } from '$lib/guides/types';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { GetGuideComments } from '$lib/remote/comments.remote';
	import {
		GetGuide,
		bookmarkGuideCommand,
		deleteGuideCommand,
		unbookmarkGuideCommand,
		unpublishGuideCommand,
		voteGuideCommand,
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
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { Separator } from '$ui/separator';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import Eye from '@lucide/svelte/icons/eye';
	import Flag from '@lucide/svelte/icons/flag';
	import Link from '@lucide/svelte/icons/link';
	import Star from '@lucide/svelte/icons/star';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import { useDebounce } from 'runed';
	import { untrack } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function notifyError(message: string) {
		console.error(message);
	}

	function notifySuccess(message: string) {
		console.info(message);
	}

	const slug = page.params.slug as string;
	const draft = page.url.searchParams.get('draft') === 'true';

	// Load comments. Guide data is already fetched and rendered by +page.server.ts.
	const commentsPromise = $derived(GetGuideComments(slug));

	let guideData = $state(untrack(() => data.guide) as FullGuideWithAuthors | undefined);
	const COMMENTS_SECTION_ID = 'comments';
	type TocItem = { level: number; text: string; id: string; isFooter?: boolean };

	const gbl = getGlobalContext();
	let authors = $derived.by((): GuideAuthorDto[] => {
		if (!guideData) return [];
		return guideData.authors?.length
			? guideData.authors
			: [{ author: guideData.author, isOwner: true, role: 'Owner' }];
	});
	let isOwner = $derived(authors.some((author) => author.isOwner && author.author.id === gbl.session?.id));
	let isGuideAuthor = $derived(authors.some((author) => author.author.id === gbl.session?.id));
	let canEditGuide = $derived(Boolean(gbl.session?.perms.admin || isGuideAuthor));
	let canManageGuide = $derived(Boolean(gbl.session?.perms.admin || isOwner));
	let parsedBlocks = $derived.by(() => parseGuideBlocks(guideData?.content));
	let renderedBlocks = $derived((guideData?.renderedBlocks ?? null) as RootNode | null);
	let renderedHtml = $derived(guideData?.renderedHtml ?? '');
	let commentsData = $derived((commentsPromise?.current ?? []) as CommentWithGuideAuthor[]);
	let hoistedComments = $derived.by(() => {
		const map: Record<string, CommentWithGuideAuthor[]> = {};
		for (const comment of commentsData) {
			if (!comment.liftedElementId || comment.isDeleted) continue;
			map[comment.liftedElementId] ??= [];
			map[comment.liftedElementId].push(comment);
		}
		return map;
	});
	let hoistTargets = $derived.by(() => (parsedBlocks ? collectGuideHoistTargets(parsedBlocks) : []));

	// Component state
	let userVote = $state<number | null>(null);
	let isBookmarked = $state(false);
	let pendingGuideVote: 0 | 1 | -1 | null = null;
	let pendingGuideVoteGuideId: number | null = null;
	let showDeleteDialog = $state(false);
	let showUnpublishDialog = $state(false);
	let showReportDialog = $state(false);
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
			void refreshGuide();
		}
	}, 400);

	$effect(() => {
		const guide = guideData as FullGuideDto | undefined;
		if (!guide) return;
		userVote = guide.userVote ?? null;
		isBookmarked = !!guide.isBookmarked;
	});

	function parseGuideBlocks(content: string | undefined): RootNode | null {
		if (!content || (!content.trim().startsWith('[') && !content.trim().startsWith('{'))) {
			return null;
		}

		try {
			const parsed = JSON.parse(content);
			return Array.isArray(parsed) ? ensureGuideBlockIds(parsed as RootNode) : null;
		} catch {
			return null;
		}
	}

	function buildTableOfContents(html: string): TocItem[] {
		if (!html) return [];
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const headings = doc.querySelectorAll('h1, h2, h3');
		const toc: TocItem[] = [];

		headings.forEach((heading, index) => {
			const level = parseInt(heading.tagName[1]);
			const text = heading.textContent || '';
			const id = `md-section-${index}`;
			heading.id = id;
			toc.push({ level, text, id });
		});

		return toc;
	}

	function buildTableOfContentsFromBlocks(blocks: BlockNode[]): TocItem[] {
		const toc: TocItem[] = [];
		blocks.forEach((block) => {
			if (block.type === 'heading') {
				const text = getTextFromInlineNodes(block.children);
				toc.push({
					level: block.level,
					text,
					id: block.id ?? '',
				});
			}
		});
		return toc;
	}

	function appendCommentsTocItem(toc: TocItem[]): TocItem[] {
		return [...toc, { level: 1, text: 'Comments', id: COMMENTS_SECTION_ID, isFooter: true }];
	}

	async function refreshGuide() {
		try {
			guideData = (await GetGuide({ slug, draft })) as FullGuideWithAuthors;
			return guideData;
		} catch (err) {
			console.error('Failed to refresh guide:', err);
			return null;
		}
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

		if (guideData?.id === guideId) {
			guideData = {
				...guideData,
				score: guideData.score + delta,
				userVote: nextVote,
			};
		}

		pendingGuideVote = nextVote;
		pendingGuideVoteGuideId = guideId;
		trackAnalytics('guides.vote', {
			value: nextVote,
		});
		flushGuideVote();
	}

	async function handleBookmark(guideId: number) {
		if (!page.data.session) {
			notifyError('Please log in to bookmark');
			return;
		}

		const oldBookmarked = isBookmarked;
		const nextBookmarked = !oldBookmarked;
		const previousGuide = guideData;
		isBookmarked = nextBookmarked;
		if (guideData) {
			guideData = { ...guideData, isBookmarked: nextBookmarked };
		}

		const cmd = nextBookmarked ? bookmarkGuideCommand : unbookmarkGuideCommand;

		try {
			const result = await cmd(guideId);

			if (result.error) {
				isBookmarked = oldBookmarked;
				guideData = previousGuide;
				notifyError(result.error);
				return;
			}

			await refreshGuide();
			notifySuccess(nextBookmarked ? 'Guide bookmarked' : 'Bookmark removed');
			trackAnalytics('guides.bookmark', {
				bookmarked: nextBookmarked,
			});
		} catch (err) {
			isBookmarked = oldBookmarked;
			guideData = previousGuide;
			notifyError('Failed to update bookmark');
			console.error(err);
		}
	}

	function handleShareGuide() {
		navigator.clipboard.writeText(window.location.href);
		trackAnalytics('guides.share');
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

	const pageCtx = getPageCtx();

	$effect.pre(() => {
		pageCtx.setBreadcrumbs([
			{
				name: 'Guides',
				href: '/guides',
			},
			{
				name: guideData?.title || '...',
				href: `/guides/${guideData?.slug || ''}`,
			},
		]);
	});
</script>

{#snippet tableOfContents(toc: TocItem[], stickyOffset: string)}
	{@const items = appendCommentsTocItem(toc)}
	<div class="sticky {stickyOffset}">
		<h3 class="mb-3 text-sm font-semibold">Table of Contents</h3>
		<nav class="flex flex-col gap-1 text-sm">
			{#each items as item (item.id)}
				<a
					href="#{item.id}"
					class="text-muted-foreground hover:text-foreground transition-colors"
					class:mt-2={item.isFooter}
					class:border-t={item.isFooter}
					class:pt-2={item.isFooter}
					class:font-medium={item.isFooter}
					style="padding-left: {item.isFooter ? 0 : (item.level - 1) * 1}rem"
				>
					{item.text}
				</a>
			{/each}
		</nav>
	</div>
{/snippet}

{#if !guideData}
	<div class="flex flex-col items-center justify-center gap-4 py-16">
		<div class="text-destructive text-lg font-semibold">Guide not found</div>
		<p class="text-muted-foreground">The guide you're looking for doesn't exist or has been deleted.</p>
		<a href="/guides">
			<Button>Back to Guides</Button>
		</a>
	</div>
{:else}
	<Head
		title={guideData.title}
		description={guideData.description}
		imageUrl="/api/item/{guideData.iconSkyblockId}.webp"
		ldJson={{
			'@context': 'https://schema.org',
			'@type': 'Article',
			headline: guideData.title,
			description: guideData.description,
			author: {
				'@type': 'Person',
				name: guideData.author.name,
			},
			datePublished: guideData.createdAt,
		}}
	/>
	<div class="flex flex-col gap-6">
		{#if guideData.isDraft && guideData.rejectionReason}
			<div class="bg-destructive/10 border-destructive my-4 rounded-lg border p-4">
				<p class="text-destructive font-semibold">Rejection Notice</p>
				<p class="mt-1 text-sm">{guideData.rejectionReason}</p>
			</div>
		{/if}

		{#if guideData.isDraft}
			<div class="bg-muted/50 border-border my-4 rounded-lg border p-4">
				<p class="font-semibold">You are viewing a draft version</p>
				<p class="text-muted-foreground mt-1 text-sm">This guide is not visible to the public.</p>
				{#if canEditGuide}
					<div class="mt-3 flex gap-2">
						<a href="/guides/{guideData.slug}/edit">
							<Button size="sm" variant="outline">Edit</Button>
						</a>
					</div>
				{/if}
			</div>
		{/if}

		<div class="flex flex-col items-center gap-6 py-10 text-center">
			<div class="flex max-w-3xl flex-col gap-4">
				<div class="relative flex items-start justify-center gap-4">
					<h1 class="text-4xl font-bold">{guideData.title}</h1>
				</div>
				<p class="text-muted-foreground text-lg">{guideData.description}</p>
			</div>

			<div class="flex flex-col items-center gap-4">
				<div class="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
					<div class="text-foreground flex flex-wrap items-center justify-center gap-2 font-medium">
						{#each authors as guideAuthor (guideAuthor.author.id)}
							<div class="flex items-center gap-1.5">
								{#if guideAuthor.author.avatar}
									<UserIcon
										user={{
											id: guideAuthor.author.id.toString(),
											avatar: guideAuthor.author.avatar,
										}}
										class="size-6 rounded-full"
									/>
								{:else}
									{@const nameParts = guideAuthor.author.name.split(' ')}
									{@const headName =
										nameParts.length === 1
											? nameParts[0]
											: nameParts.sort((a, b) => b.length - a.length)[0]}
									<PlayerHead uuid={headName} class="size-6" />
								{/if}
								<span>{guideAuthor.author.name}</span>
							</div>
						{/each}
					</div>
					<DateDisplay timestamp={new Date(guideData.createdAt).getTime()} />
					<span class="flex items-center gap-1">
						<Eye class="h-3 w-3" />
						{guideData.viewCount}
					</span>
				</div>

				<div class="flex flex-wrap items-center justify-center gap-2">
					{#each guideData.tags as tag (tag)}
						<Badge variant="secondary">{tag}</Badge>
					{/each}
				</div>

				<div class="mt-2 flex flex-wrap items-center justify-center gap-2">
					{@render guideActions(guideData)}
				</div>
			</div>
		</div>

		<Separator />

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
			<div class="lg:col-span-3">
				{#if renderedBlocks}
					{#key guideData.content}
						<div class="prose dark:prose-invert mb-8 max-w-none">
							<BlockRenderer content={renderedBlocks} {hoistedComments} renderTextAsHtml />
						</div>
					{/key}
				{:else if parsedBlocks}
					{#key guideData.content}
						<div class="prose dark:prose-invert mb-8 max-w-none">
							<BlockRenderer content={parsedBlocks} {hoistedComments} />
						</div>
					{/key}
				{:else}
					<div class="prose dark:prose-invert mb-8 max-w-none">
						<RenderHtml content={renderedHtml} />
					</div>
				{/if}

				<Separator class="my-8" />

				<div class="mt-2 mb-4 flex flex-wrap items-center justify-start gap-2">
					{@render guideActions(guideData)}
				</div>

				<div id={COMMENTS_SECTION_ID} class="scroll-mt-20">
					<CommentSectionContainer
						guideId={guideData.id}
						{commentsPromise}
						session={page.data.session}
						{notifyError}
						{notifySuccess}
						canHoist={canEditGuide}
						{hoistTargets}
					/>
				</div>
			</div>

			<div class="hidden lg:block">
				{#if parsedBlocks}
					{@const toc = buildTableOfContentsFromBlocks(parsedBlocks)}
					{@render tableOfContents(toc, 'top-20')}
				{:else}
					{@const toc = buildTableOfContents(renderedHtml)}
					{@render tableOfContents(toc, 'top-4')}
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
					onclick={() => handleDeleteGuide(guideData!.id)}
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
					onclick={() => handleUnpublishGuide(guideData!.id)}
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

	{#snippet guideActions(guide: FullGuideWithAuthors)}
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
			<span class="min-w-8 px-3 py-1 text-center text-sm font-semibold">{guide.score.toLocaleString()}</span>
			<Button
				variant={userVote === -1 ? 'default' : 'ghost'}
				size="sm"
				onclick={() => handleVote(guide.id, -1)}
				class="rounded-none rounded-r-md border-l px-3"
			>
				<ThumbsDown class="h-4 w-4" />
			</Button>
		</div>

		<Button variant={isBookmarked ? 'default' : 'outline'} size="sm" onclick={() => handleBookmark(guide.id)}>
			<Star class="mr-2 h-4 w-4" />
			Bookmark
		</Button>

		<Button variant="outline" size="sm" onclick={handleShareGuide}>
			<Link class="mr-2 h-4 w-4" />
			Share
		</Button>

		{#if gbl.authorized}
			<Button variant="outline" size="sm" onclick={() => (showReportDialog = true)}>
				<Flag class="h-4 w-4" />
			</Button>
		{/if}

		{#if canEditGuide || canManageGuide}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm" aria-label="Open menu">
							<Ellipsis class="h-4 w-4" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					{#if canEditGuide}
						<DropdownMenu.Item onclick={() => goto(`/guides/${guide.slug}/edit`)}>Edit</DropdownMenu.Item>
					{/if}
					{#if canManageGuide}
						<DropdownMenu.Item onclick={() => (showUnpublishDialog = true)} class="text-destructive"
							>Unpublish</DropdownMenu.Item
						>
						<DropdownMenu.Item onclick={() => (showDeleteDialog = true)} class="text-destructive">
							Delete
						</DropdownMenu.Item>
					{/if}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
	{/snippet}

	<ContentReportDialog
		open={showReportDialog}
		targetType="guide"
		targetId={guideData.id}
		onOpenChange={(open) => (showReportDialog = open)}
	/>
{/if}
