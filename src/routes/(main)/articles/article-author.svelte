<script lang="ts">
	import { env } from '$env/dynamic/public';
	import type { ArticleItemType } from '$lib/api/cms';
	import type { DeepPartialNullable } from '$lib/utils';
	import type { Snippet } from 'svelte';
	const { PUBLIC_STRAPI_API_URL } = env;

	let {
		article,
		children,
	}: {
		article:
			| ArticleItemType
			| DeepPartialNullable<ArticleItemType>
			| Pick<DeepPartialNullable<ArticleItemType>, 'author'>;
		children?: Snippet;
	} = $props();
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
