<script lang="ts">
	import { PUBLIC_STRAPI_API_URL } from '$env/static/public';
	import type { ArticleItemType } from '$lib/api/cms';

	let { article }: { article: ArticleItemType } = $props();
</script>

<a class="group flex w-full max-w-sm flex-col items-start gap-2 p-1" href="/articles/{article.slug}">
	<article class="flex flex-col gap-2">
		<img
			src={article.cover?.url
				? `${PUBLIC_STRAPI_API_URL}${article.cover.url}`
				: '/images/default-farming-news.png'}
			alt={article.title}
			class="aspect-video w-full rounded-md bg-black object-cover opacity-85 transition-all duration-300 ease-in-out group-hover:opacity-100"
		/>
		<h3 class="text-2xl font-semibold">{article.title}</h3>
		<p class="text-sm">{article.summary}</p>
	</article>
</a>
