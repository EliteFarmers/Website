<script lang="ts">
	import type { UserGuideResponse } from '$lib/api/schemas';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { GetUserGuides } from '$lib/remote/guides.remote';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';

	const gbl = getGlobalContext();

	const guides = GetUserGuides(gbl.authorized ? gbl.session!.id : 0);
	let selectedStatus = $state<string>('all');

	function filterByStatus(list: UserGuideResponse[] | undefined, status: string): UserGuideResponse[] {
		if (!list) return [];
		if (status === 'all') return list;
		return list.filter((g) => g.status === status);
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold">My Guides</h1>
		<p class="text-muted-foreground">View and manage your created guides</p>
	</div>

	<Tabs bind:value={selectedStatus}>
		<TabsList>
			<TabsTrigger value="all">All</TabsTrigger>
			<TabsTrigger value="draft">Draft</TabsTrigger>
			<TabsTrigger value="pending">Pending</TabsTrigger>
			<TabsTrigger value="published">Published</TabsTrigger>
			<TabsTrigger value="rejected">Rejected</TabsTrigger>
		</TabsList>

		<TabsContent value="all" class="space-y-4">
			{#await guides}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
						<div class="bg-muted h-32 animate-pulse rounded-lg"></div>
					{/each}
				</div>
			{:then guideList}
				{#if !guideList || guideList.length === 0}
					<div class="flex flex-col items-center justify-center gap-4 py-12">
						<div class="text-lg font-semibold">No guides yet</div>
						<p class="text-muted-foreground">Create your first guide</p>
						<a href="/guides/new">
							<Button>Create Guide</Button>
						</a>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each filterByStatus(guideList, selectedStatus) as guide (guide.id)}
							<a href="/guides/{guide.slug}{guide.status === '1' ? '/edit' : ''}" class="group">
								<Card class="h-full cursor-pointer transition-shadow hover:shadow-lg">
									<CardHeader class="pb-3">
										<CardTitle class="line-clamp-2 text-base">{guide.title}</CardTitle>
										<CardDescription class="mt-1 line-clamp-2">{guide.description}</CardDescription>
									</CardHeader>
									<CardContent class="flex flex-col gap-3">
										<Badge variant="secondary" class="w-fit text-xs">{guide.status}</Badge>
									</CardContent>
								</Card>
							</a>
						{/each}
					</div>
				{/if}
			{:catch}
				<div class="flex flex-col items-center justify-center gap-4 py-12">
					<div class="text-destructive text-lg font-semibold">Error loading guides</div>
				</div>
			{/await}
		</TabsContent>

		<TabsContent value="draft" class="space-y-4">
			{#await guides}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
						<div class="bg-muted h-32 animate-pulse rounded-lg"></div>
					{/each}
				</div>
			{:then guideList}
				{#if filterByStatus(guideList, 'draft').length === 0}
					<div class="flex flex-col items-center justify-center gap-4 py-12">
						<p class="text-muted-foreground">No draft guides</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each filterByStatus(guideList, 'draft') as guide (guide.id)}
							<a href="/guides/{guide.slug}/edit" class="group">
								<Card class="h-full cursor-pointer transition-shadow hover:shadow-lg">
									<CardHeader class="pb-3">
										<CardTitle class="line-clamp-2 text-base">{guide.title}</CardTitle>
										<CardDescription class="mt-1 line-clamp-2">{guide.description}</CardDescription>
									</CardHeader>
									<CardContent class="flex flex-col gap-3">
										<Badge variant="secondary" class="w-fit text-xs">{guide.status}</Badge>
									</CardContent>
								</Card>
							</a>
						{/each}
					</div>
				{/if}
			{:catch}
				<div class="flex flex-col items-center justify-center gap-4 py-12">
					<div class="text-destructive text-lg font-semibold">Error loading guides</div>
				</div>
			{/await}
		</TabsContent>

		<TabsContent value="pending" class="space-y-4">
			{#await guides}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
						<div class="bg-muted h-32 animate-pulse rounded-lg"></div>
					{/each}
				</div>
			{:then guideList}
				{#if filterByStatus(guideList, 'pending').length === 0}
					<div class="flex flex-col items-center justify-center gap-4 py-12">
						<p class="text-muted-foreground">No pending guides</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each filterByStatus(guideList, 'pending') as guide (guide.id)}
							<a href="/guides/{guide.slug}" class="group">
								<Card class="h-full cursor-pointer transition-shadow hover:shadow-lg">
									<CardHeader class="pb-3">
										<CardTitle class="line-clamp-2 text-base">{guide.title}</CardTitle>
										<CardDescription class="mt-1 line-clamp-2">{guide.description}</CardDescription>
									</CardHeader>
									<CardContent class="flex flex-col gap-3">
										<Badge variant="secondary" class="w-fit text-xs">{guide.status}</Badge>
									</CardContent>
								</Card>
							</a>
						{/each}
					</div>
				{/if}
			{:catch}
				<div class="flex flex-col items-center justify-center gap-4 py-12">
					<div class="text-destructive text-lg font-semibold">Error loading guides</div>
				</div>
			{/await}
		</TabsContent>

		<TabsContent value="published" class="space-y-4">
			{#await guides}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
						<div class="bg-muted h-32 animate-pulse rounded-lg"></div>
					{/each}
				</div>
			{:then guideList}
				{#if filterByStatus(guideList, 'published').length === 0}
					<div class="flex flex-col items-center justify-center gap-4 py-12">
						<p class="text-muted-foreground">No published guides</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each filterByStatus(guideList, 'published') as guide (guide.id)}
							<a href="/guides/{guide.slug}" class="group">
								<Card class="h-full cursor-pointer transition-shadow hover:shadow-lg">
									<CardHeader class="pb-3">
										<CardTitle class="line-clamp-2 text-base">{guide.title}</CardTitle>
										<CardDescription class="mt-1 line-clamp-2">{guide.description}</CardDescription>
									</CardHeader>
									<CardContent class="flex flex-col gap-3">
										<Badge variant="secondary" class="w-fit text-xs">{guide.status}</Badge>
									</CardContent>
								</Card>
							</a>
						{/each}
					</div>
				{/if}
			{:catch}
				<div class="flex flex-col items-center justify-center gap-4 py-12">
					<div class="text-destructive text-lg font-semibold">Error loading guides</div>
				</div>
			{/await}
		</TabsContent>

		<TabsContent value="rejected" class="space-y-4">
			{#await guides}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
						<div class="bg-muted h-32 animate-pulse rounded-lg"></div>
					{/each}
				</div>
			{:then guideList}
				{#if filterByStatus(guideList, 'rejected').length === 0}
					<div class="flex flex-col items-center justify-center gap-4 py-12">
						<p class="text-muted-foreground">No rejected guides</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each filterByStatus(guideList, 'rejected') as guide (guide.id)}
							<a href="/guides/{guide.slug}" class="group">
								<Card class="h-full cursor-pointer transition-shadow hover:shadow-lg">
									<CardHeader class="pb-3">
										<CardTitle class="line-clamp-2 text-base">{guide.title}</CardTitle>
										<CardDescription class="mt-1 line-clamp-2">{guide.description}</CardDescription>
									</CardHeader>
									<CardContent class="flex flex-col gap-3">
										<Badge variant="secondary" class="w-fit text-xs">{guide.status}</Badge>
									</CardContent>
								</Card>
							</a>
						{/each}
					</div>
				{/if}
			{:catch}
				<div class="flex flex-col items-center justify-center gap-4 py-12">
					<div class="text-destructive text-lg font-semibold">Error loading guides</div>
				</div>
			{/await}
		</TabsContent>
	</Tabs>
</div>
