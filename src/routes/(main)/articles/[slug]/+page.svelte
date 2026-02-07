<script lang="ts">
	import { page } from '$app/state';
	import BlockRenderer from '$comp/blocks/block-renderer.svelte';
	import type { RootNode } from '$comp/blocks/blocks';
	import Head from '$comp/head.svelte';
	import DateDisplay from '$comp/time/date-display.svelte';
	import { PUBLIC_HOST_URL, PUBLIC_STRAPI_API_URL } from '$env/static/public';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import ArticleAuthor from '../article-author.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const article = $derived(data.article);

	const pageCtx = getPageCtx();
	const crumbs = $derived([
		{ name: 'Articles', href: '/articles' },
		{ name: article.title ?? 'Untitled Article', href: `/articles/${article.slug}` },
	]);

	$effect(() => {
		pageCtx.setBreadcrumbs(crumbs);
	});

	const fullCoverUrl = $derived(
		article.cover?.url
			? `${PUBLIC_STRAPI_API_URL}${article.cover.url}`
			: `${PUBLIC_HOST_URL}/images/default-farming-news.png`
	);

	const jsonData = $derived({
		'@context': 'https://schema.org',
		'@type': 'Article',
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': `${PUBLIC_HOST_URL}/articles/${article.slug}`,
		},
		headline: article.title,
		description: article.summary,
		image: {
			'@type': 'ImageObject',
			url: fullCoverUrl,
			width: article.cover?.width || 1280,
			height: article.cover?.height || 720,
		},
		author: {
			'@type': 'Person',
			name: article.author?.name || `${page.url.hostname} Team`,
		},
		publisher: {
			'@type': 'Organization',
			name: page.url.hostname,
			logo: {
				'@type': 'ImageObject',
				url: `${PUBLIC_HOST_URL}/favicon.webp`, // Replace with your actual logo URL
			},
		},
		datePublished: new Date(article.releasedAt ?? Date.now()).toISOString(),
		dateModified: new Date(article.lastUpdated ?? article.releasedAt ?? Date.now()).toISOString(),
	});
</script>

<Head
	title={article.metaTitle ?? article.title ?? 'Elite | Skyblock Farming Weight'}
	description={article.metaDescription ?? article.summary ?? `Read this article on ${page.url.hostname}!`}
	imageUrl={fullCoverUrl}
	canonicalPath="/articles/{article.slug}"
	twitterCardType="summary_large_image"
	ldJson={jsonData}
>
	<meta property="twitter:title" content={article.title} />
	<meta property="og:type" content="article" />
	<meta name="twitter:description" content={article.summary} />
</Head>

<main class="flex w-full flex-col items-center">
	<article class="md:bg-card my-8 flex max-w-4xl flex-col justify-center px-2 py-8 md:p-16">
		<div>
			<img
				src={article.cover?.url
					? `${PUBLIC_STRAPI_API_URL}${article.cover.url}`
					: '/images/default-farming-news.png'}
				alt={article.title}
				class="aspect-video w-full max-w-3xl rounded-md"
				width={article.cover?.width || 1280}
				height={article.cover?.height || 720}
			/>
		</div>

		<h1 class="mt-6 mb-3 text-4xl font-bold">{article.title}</h1>
		<ArticleAuthor {article}>
			{#if article.releasedAt}
				<DateDisplay timestamp={new Date(article.releasedAt).getTime()} />
				{#if new Date(article.releasedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000}
					<span class="text-completed text-sm font-semibold">NEW</span>
				{/if}
			{/if}
		</ArticleAuthor>

		{#if article.lastUpdated && article.lastUpdated !== article.releasedAt}
			<div class="text-muted-foreground mt-1 text-sm">
				Last updated: <DateDisplay timestamp={new Date(article.lastUpdated).getTime()} />
			</div>
		{/if}

		<svelte:boundary onerror={(e) => console.error(e)}>
			<BlockRenderer content={article.content as RootNode} />
		</svelte:boundary>
	</article>
</main>
