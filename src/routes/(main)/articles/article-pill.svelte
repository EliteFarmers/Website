<script lang="ts">
	import DateDisplay from '$comp/time/date-display.svelte';
	import { PUBLIC_STRAPI_API_URL } from '$env/static/public';
	import type { ArticleItemType } from '$lib/api/cms';
	import ArticleAuthor from './article-author.svelte';

	let { article }: { article: ArticleItemType } = $props();
</script>

<a class="group flex w-sm flex-col items-start gap-2 p-1" href="/articles/{article.slug}">
	<article class="mb-6 flex flex-col gap-2">
		<img
			src={article.cover?.url
				? `${PUBLIC_STRAPI_API_URL}${article.cover.url}`
				: '/images/default-farming-news.png'}
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

		<h3 class="text-2xl font-semibold">{article.title}</h3>
		<p class="text-sm">{article.summary}</p>
	</article>
</a>
