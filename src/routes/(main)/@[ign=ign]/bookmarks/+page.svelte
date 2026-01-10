<script lang="ts">
	import { GetUserBookmarks } from '$lib/remote/guides.remote';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$ui/card';
	import Eye from '@lucide/svelte/icons/eye';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import { formatDistanceToNow } from 'date-fns';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const bookmarks = GetUserBookmarks(data.accountId);
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Bookmarks</h1>
	</div>

	{#await bookmarks}
		<div class="grid gap-4">
			{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
				<div class="bg-muted h-32 animate-pulse rounded-lg"></div>
			{/each}
		</div>
	{:then bookmarkList}
		{#if !bookmarkList || bookmarkList.length === 0}
			<Card>
				<CardContent class="pt-6 text-center">
					<p class="text-muted-foreground mb-4">You haven't bookmarked any guides yet</p>
					<a href="/guides">
						<Button>Browse Guides</Button>
					</a>
				</CardContent>
			</Card>
		{:else}
			<div class="grid gap-4">
				{#each bookmarkList as guide (guide.id)}
					<a href="/guides/{guide.slug}" class="group">
						<Card class="cursor-pointer transition-shadow hover:shadow-lg">
							<CardHeader class="pb-3">
								<div class="flex items-start justify-between gap-2">
									<div class="flex-1">
										<CardTitle class="text-lg">{guide.title}</CardTitle>
										<CardDescription>{guide.description}</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent class="flex flex-col gap-3">
								<div class="text-muted-foreground flex items-center justify-between text-sm">
									<span class="inline-flex items-center gap-1">
										<ThumbsUp class="h-4 w-4" />
										{guide.score}
									</span>
									<span class="inline-flex items-center gap-1">
										<Eye class="h-4 w-4" />
										{guide.viewCount}
									</span>
									<span>{formatDistanceToNow(new Date(guide.createdAt), { addSuffix: true })}</span>
								</div>
								<Badge variant="secondary" class="w-fit text-xs">Bookmarked</Badge>
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
		{/if}
	{:catch}
		<Card>
			<CardContent class="pt-6 text-center">
				<p class="text-destructive">Failed to load bookmarks</p>
				<Button onclick={() => bookmarks.refresh()} class="mt-4" variant="outline">Retry</Button>
			</CardContent>
		</Card>
	{/await}
</div>
