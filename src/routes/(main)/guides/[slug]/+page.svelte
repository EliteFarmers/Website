<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BlockRenderer from '$comp/blocks/block-renderer.svelte';
	import type { BlockNode, InlineNode } from '$comp/blocks/blocks';
	import { CommentSectionContainer } from '$comp/comments';
	import UserIcon from '$comp/discord/user-icon.svelte';
	import Head from '$comp/head.svelte';
	import RenderHtml from '$comp/markdown/render-html.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import DateDisplay from '$comp/time/date-display.svelte';
	import type { FullGuideDto, GuideDto } from '$lib/api/schemas';
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
	import { useDebounce } from 'runed';
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

	// Load guide and comments
	const guidePromise = GetGuide({ slug, draft });
	const commentsPromise = GetGuideComments(slug);

	const guideData = $derived(guidePromise?.current ?? data.guide);

	const gbl = getGlobalContext();
	let isOwner = $derived(guideData?.author?.id === gbl.session?.id);

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
		const guide = guideData as FullGuideDto | undefined;
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
		const guide = guideData as GuideDto | undefined;
		if (!guide) return '';
		const split = guide.author.name.split(' ');
		return split.length === 1 ? split[0] : split.sort((a, b) => b.length - a.length)[0];
	});

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
				{#if page.data.session?.perms.admin}
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
					<div class="text-foreground flex items-center gap-2 font-medium">
						{#if guideData.author.avatar}
							<UserIcon
								user={{ id: guideData.author.id.toString(), avatar: guideData.author.avatar }}
								class="size-6 rounded-full"
							/>
						{:else}
							<PlayerHead uuid={ign} class="size-6" />
						{/if}
						<span>{guideData.author.name}</span>
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
					{@render guideActions()}
				</div>
			</div>
		</div>

		<Separator />

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
			<div class="lg:col-span-3">
				{#if guideData.content.trim().startsWith('[') || guideData.content.trim().startsWith('{')}
					{#key guideData.content}
						{@const parsed = (() => {
							try {
								const p = JSON.parse(guideData.content);
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
								{#await getHtmlFromMarkdown(guideData.content) then html}
									<RenderHtml content={html} />
								{/await}
							</div>
						{/if}
					{/key}
				{:else}
					<div class="prose dark:prose-invert mb-8 max-w-none">
						{#await getHtmlFromMarkdown(guideData.content) then html}
							<RenderHtml content={html} />
						{/await}
					</div>
				{/if}

				<Separator class="my-8" />

				<div class="mt-2 mb-4 flex flex-wrap items-center justify-start gap-2">
					{@render guideActions()}
				</div>

				<CommentSectionContainer
					guideId={guideData.id}
					{commentsPromise}
					session={page.data.session}
					{notifyError}
					{notifySuccess}
				/>
			</div>

			<div class="hidden lg:block">
				{#if guideData.content.trim().startsWith('[') || guideData.content.trim().startsWith('{')}
					{#key guideData.content}
						{@const parsed = (() => {
							try {
								const p = JSON.parse(guideData.content);
								return Array.isArray(p) ? p : null;
							} catch {
								return null;
							}
						})()}
						{#if parsed}
							{@const toc = buildTableOfContentsFromBlocks(parsed)}
							{#if toc.length > 0}
								<div class="sticky top-20">
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
							{#await getHtmlFromMarkdown(guideData.content) then html}
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
					{#await getHtmlFromMarkdown(guideData.content) then html}
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
					onclick={() => handleDeleteGuide(guideData.id)}
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
					onclick={() => handleUnpublishGuide(guideData.id)}
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

	{#snippet guideActions()}
		<div class="bg-card flex items-center rounded-lg border">
			<Button
				variant={userVote === 1 ? 'default' : 'ghost'}
				size="sm"
				onclick={() => handleVote(guideData.id, 1)}
				class="rounded-none rounded-l-md border-r px-3"
			>
				<ThumbsUp class="mr-2 h-4 w-4" />
				Like
			</Button>
			<span class="min-w-8 px-3 py-1 text-center text-sm font-semibold">{guideData.score.toLocaleString()}</span>
			<Button
				variant={userVote === -1 ? 'default' : 'ghost'}
				size="sm"
				onclick={() => handleVote(guideData.id, -1)}
				class="rounded-none rounded-r-md border-l px-3"
			>
				<ThumbsDown class="h-4 w-4" />
			</Button>
		</div>

		<Button variant={isBookmarked ? 'default' : 'outline'} size="sm" onclick={() => handleBookmark(guideData.id)}>
			<Star class="mr-2 h-4 w-4" />
			Bookmark
		</Button>

		<Button variant="outline" size="sm" onclick={() => navigator.clipboard.writeText(window.location.href)}>
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
						<DropdownMenu.Item onclick={() => (showUnpublishDialog = true)}>Unpublish</DropdownMenu.Item>
					{/if}
					<DropdownMenu.Item onclick={() => goto(`/guides/${guideData.slug}/edit`)}>Edit</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => (showDeleteDialog = true)} class="text-destructive">
						Delete
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
	{/snippet}
{/if}
