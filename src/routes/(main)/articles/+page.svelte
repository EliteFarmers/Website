<script lang="ts">
	import Head from '$comp/head.svelte';
	import type { PageProps } from './$types';
	import ArticlePill from './article-pill.svelte';
	import ArticlesFilter from './articles-filter.svelte';
	import ArticlesPagination from './articles-pagination.svelte';

	let { data }: PageProps = $props();

	let articles = $derived(data.defaultArticles);
</script>

<Head
	title="Articles"
	description="Browse articles on elitebot.dev! See Hypixel Skyblock Farming news, site updates, and more."
/>

<main class="@container flex flex-col items-center">
	<h1 class="my-16 text-4xl font-bold">Articles</h1>
	<div
		class="mb-1 flex w-full max-w-[24rem] flex-col items-center justify-between gap-2 p-1 @3xl:max-w-198 @3xl:flex-row @6xl:max-w-300"
	>
		<ArticlesFilter
			query="category"
			options={data.categories?.map((cat) => ({ label: cat.name, value: cat.slug })) || []}
			title="Category"
		/>
		<ArticlesPagination
			currentPage={data.defaultMeta?.pagination?.page ?? 1}
			maxPage={data.defaultMeta?.pagination?.pageCount ?? 1}
		/>
	</div>
	<div class="mx-4 grid grid-cols-1 gap-6 @3xl:grid-cols-2 @6xl:grid-cols-3">
		{#each articles as article (article.slug)}
			<ArticlePill {article} />
		{:else}
			<p class="col-span-full text-center text-muted-foreground my-32">No articles found!</p>
		{/each}
	</div>
	<div
		class="mb-1 flex w-full max-w-[24rem] flex-row items-center justify-center p-1 @3xl:max-w-198 @3xl:justify-end @6xl:max-w-300"
	>
		<ArticlesPagination
			currentPage={data.defaultMeta?.pagination?.page ?? 1}
			maxPage={data.defaultMeta?.pagination?.pageCount ?? 1}
		/>
	</div>
</main>
