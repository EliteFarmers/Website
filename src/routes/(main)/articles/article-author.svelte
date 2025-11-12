<script lang="ts">
	import { PUBLIC_STRAPI_API_URL } from '$env/static/public';
	import type { ArticleItemType } from '$lib/api/cms';
	import type { DeepPartialNullable } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let { article, children }: { article: ArticleItemType | DeepPartialNullable<ArticleItemType>; children?: Snippet } =
		$props();
</script>

<div class="flex flex-row items-center gap-2">
	<img
		src={article.author?.avatar?.url ? `${PUBLIC_STRAPI_API_URL}${article.author.avatar.url}` : '/favicon.webp'}
		alt={article.author?.name || 'Admin'}
		class="size-6 rounded-full bg-black object-cover"
	/>
	<span class="text-sm">{article.author?.name || 'Admin'}</span>
	{@render children?.()}
</div>
