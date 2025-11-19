<script lang="ts">
	import StrapiImage from '$comp/strapi-image.svelte';
	import DateDisplay from '$comp/time/date-display.svelte';
	import type { ArticleItemType } from '$lib/api/cms';
	import ArticleAuthor from './article-author.svelte';

	let { article }: { article: ArticleItemType } = $props();
</script>

<a class="group flex w-full flex-col items-start gap-2 p-1 @sm:w-sm" href="/articles/{article.slug}">
	<article class="mb-6 flex flex-col gap-2">
		<StrapiImage
			cover={article.cover}
			alt={article.title}
			class="aspect-video w-full rounded-md bg-black object-cover opacity-85 transition-all duration-300 ease-in-out group-hover:opacity-100"
		/>
		<div
			class="text-muted-foreground group-hover:text-primary flex flex-row items-center justify-between gap-2 transition-all duration-300 ease-in-out"
		>
			<ArticleAuthor {article} />
			{#if article.releasedAt}
				<div class="flex flex-row items-center gap-2 text-sm">
					<DateDisplay timestamp={new Date(article.releasedAt).getTime()} />
				</div>
			{/if}
		</div>

		<h3 class="text-xl font-semibold sm:text-2xl">{article.title}</h3>
		<p class="text-sm">{article.summary}</p>
		<div class="flex flex-row items-center gap-1">
			{#each article.categories as c (c.slug)}
				<span class="bg-muted inline-block rounded-sm px-2 py-0.5 text-xs font-semibold">{c.name}</span>
			{/each}
		</div>
	</article>
</a>
