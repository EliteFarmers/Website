<script lang="ts">
	import BlockRenderer from '$comp/blocks/block-renderer.svelte';
	import type { RootNode } from '$comp/blocks/blocks';
	import Head from '$comp/head.svelte';
	import { PUBLIC_HOST_URL, PUBLIC_STRAPI_API_URL } from '$env/static/public';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const article = $derived(data.article);

	const page = getPageCtx();
	const crumbs = $derived([
		{ name: 'Articles', href: '/articles' },
		{ name: article.title ?? 'Untitled Article', href: `/articles/${article.slug}` },
	]);

	$effect(() => {
		page.setBreadcrumbs(crumbs);
	});
</script>

<Head
	title={article.metaTitle ?? article.title ?? 'Elite | Skyblock Farming Weight'}
	description={article.metaDescription ?? article.summary ?? 'Read this article on elitebot.dev!'}
	imageUrl={article.cover?.url
		? `${PUBLIC_STRAPI_API_URL}${article.cover.url}`
		: PUBLIC_HOST_URL + '/images/default-farming-news.png'}
	twitterCardType="summary_large_image"
/>

<main class="flex w-full flex-col items-center">
	<article class="bg-card my-8 flex max-w-4xl flex-col justify-center p-16">
		<div>
			<img
				src={article.cover?.url
					? `${PUBLIC_STRAPI_API_URL}${article.cover.url}`
					: '/images/default-farming-news.png'}
				alt={article.title}
				class="aspect-video w-full max-w-3xl rounded-md"
			/>
		</div>

		<h1 class="mt-6 mb-6 text-4xl font-bold">{article.title}</h1>
		<!-- <p class="mb-6 text-lg">{article.summary}</p> -->

		<svelte:boundary onerror={(e) => console.error(e)}>
			<BlockRenderer content={article.content as RootNode} />
			{#snippet failed(_error, reset)}
				<button onclick={reset}>oops! try again</button>
			{/snippet}
		</svelte:boundary>
	</article>
</main>
