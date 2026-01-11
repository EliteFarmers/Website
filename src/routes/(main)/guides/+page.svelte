<script lang="ts">
	import Head from '$comp/head.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import type { GuideDto } from '$lib/api/schemas';
	import { ListGuides, ListTags } from '$lib/remote/guides.remote';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { SelectSimple } from '$ui/select';
	import { Separator } from '$ui/separator';

	interface GuideItem extends GuideDto {
		description?: string;
		skyblockIconId?: string;
		tags?: string[];
		viewCount?: number;
		score?: number;
	}

	let searchQuery = $state('');
	let selectedTags = $state<number[]>([]);
	let selectedType = $state<string>('');
	let sortBy = $state('topRated');
	let currentPage = $state(0);

	const listParams = $derived.by(() => {
		const params: Parameters<typeof ListGuides>[0] = {
			sort: sortBy,
			page: currentPage,
			pageSize: 20,
		};
		if (searchQuery) params.query = searchQuery;
		if (selectedTags.length) params.tags = selectedTags;
		if (selectedType && selectedType !== '') params.type = parseInt(selectedType);
		return params;
	});

	const guides = $derived(ListGuides(listParams));
	const tags = $derived(ListTags());

	const guideTypes = [
		{ label: 'All Types', value: '' },
		{ label: 'General', value: '0' },
		{ label: 'Farming', value: '1' },
		{ label: 'Greenhouse', value: '2' },
		{ label: 'Contest', value: '3' },
	];

	const sortOptions = [
		{ label: 'Newest', value: 'newest' },
		{ label: 'Top Rated', value: 'topRated' },
		{ label: 'Trending', value: 'trending' },
	];

	function toggleTag(tagId: number) {
		if (selectedTags.includes(tagId)) {
			selectedTags = selectedTags.filter((id) => id !== tagId);
		} else {
			selectedTags = [...selectedTags, tagId];
		}
		currentPage = 0;
	}

	function handleSearch(value: string) {
		searchQuery = value;
		currentPage = 0;
	}
</script>

<Head title="Guides" description="Discover community guides." />

<main class="@container flex flex-col items-center">
	<div class="my-16 text-center">
		<h1 class="text-4xl font-bold">Community Guides</h1>
		<p class="text-muted-foreground mt-2">Discover and share guides created by the community</p>
		<div class="mt-6 flex items-center justify-center gap-2">
			<a href="/guides/new">
				<Button>Create Guide</Button>
			</a>
		</div>
	</div>

	<Separator class="w-full" />

	<div class="my-8 flex w-full max-w-96 flex-col gap-4 px-4 @sm:max-w-lg @2xl:max-w-2xl @6xl:max-w-4xl @6xl:flex-row">
		<div class="flex-1">
			<Input
				type="text"
				placeholder="Search guides..."
				value={searchQuery}
				onchange={(e) => handleSearch(e.currentTarget.value)}
			/>
		</div>

		<SelectSimple
			bind:value={selectedType}
			options={guideTypes}
			change={() => (currentPage = 0)}
			placeholder="Guide Type"
			class="w-full @6xl:w-40"
		/>

		<SelectSimple
			bind:value={sortBy}
			options={sortOptions}
			change={() => (currentPage = 0)}
			placeholder="Sort By"
			class="w-full @6xl:w-40"
		/>
	</div>

	{#await tags then tagList}
		{#if tagList?.length}
			<div class="mb-6 w-full max-w-96 px-4 @sm:max-w-lg @2xl:max-w-2xl @6xl:max-w-4xl">
				<div class="mb-2 text-sm font-semibold">Tags</div>
				<div class="flex flex-wrap gap-2">
					{#each tagList as tag (tag.id)}
						<button onclick={() => toggleTag(tag.id)} class="cursor-pointer">
							<Badge variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}>
								{tag.name}
							</Badge>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	{/await}

	<Separator class="my-8 w-full" />

	{#await guides}
		<div
			class="mb-8 grid w-full max-w-96 grid-cols-1 gap-4 px-4 @sm:max-w-lg @2xl:max-w-2xl @6xl:max-w-4xl @6xl:grid-cols-2"
		>
			{#each Array.from({ length: 6 }, (_, i) => i) as i (i)}
				<div class="bg-muted h-48 animate-pulse rounded-lg"></div>
			{/each}
		</div>
	{:then guideList}
		{#if !guideList || (Array.isArray(guideList) && guideList.length === 0)}
			<div class="flex flex-col items-center justify-center gap-4 py-16">
				<div class="text-lg font-semibold">No guides found</div>
				<p class="text-muted-foreground">Try adjusting filters or create a new guide</p>
				<a href="/guides/new"><Button>Create the first guide</Button></a>
			</div>
		{:else}
			<div
				class="mb-8 grid w-full max-w-96 grid-cols-1 gap-4 px-4 @sm:max-w-lg @2xl:max-w-2xl @6xl:max-w-4xl @6xl:grid-cols-2"
			>
				{#each guideList as guide (guide.id)}
					{@const g = guide as unknown as GuideItem}
					<a href="/guides/{guide.slug}" class="group">
						<div
							class="bg-card hover:border-primary flex h-full flex-col gap-3 rounded-lg border p-4 transition-all hover:shadow-md"
						>
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0 flex-1">
									<h3
										class="group-hover:text-primary line-clamp-2 text-lg font-semibold wrap-break-word"
									>
										{guide.title}
									</h3>
									{#if g.description}
										<p class="text-muted-foreground mt-1 line-clamp-2 text-sm wrap-break-word">
											{g.description}
										</p>
									{/if}
								</div>
								{#if g.skyblockIconId}
									<div class="shrink-0">
										<ItemRender skyblockId={g.skyblockIconId} class="size-12" />
									</div>
								{/if}
							</div>

							<div class="mt-auto flex flex-wrap gap-2">
								{#if g.tags?.length}
									{#each g.tags as tag (tag)}
										<Badge variant="secondary" class="text-xs">{tag}</Badge>
									{/each}
								{:else}
									<Badge variant="outline" class="text-xs">No tags</Badge>
								{/if}
							</div>

							<div class="text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
								<span>{g.viewCount ?? 0} views</span>
								<span>⭐ {g.score ?? 0}</span>
							</div>
						</div>
					</a>
				{/each}
			</div>

			<div class="mb-16 flex items-center justify-center gap-2">
				<Button
					variant="outline"
					disabled={currentPage === 0}
					onclick={() => (currentPage = Math.max(0, currentPage - 1))}>Previous</Button
				>
				<span class="text-muted-foreground text-sm">Page {currentPage + 1}</span>
				<Button
					variant="outline"
					disabled={guideList.length < 20}
					onclick={() => (currentPage = currentPage + 1)}>Next</Button
				>
			</div>
		{/if}
	{:catch error}
		<div class="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
			<div class="text-destructive text-lg font-semibold">Failed to load guides</div>
			<p class="text-muted-foreground max-w-sm">{error?.message || 'Please try again later'}</p>
		</div>
	{/await}
</main>
