<script lang="ts">
	import Head from '$comp/head.svelte';
	import type { PageProps } from './$types';
	import ArticlePill from './article-pill.svelte';

	let { data }: PageProps = $props();

	let articles = $derived(data.defaultArticles);
</script>

<Head
	title="Articles"
	description="Browse articles on elitebot.dev! See Hypixel Skyblock Farming news, site updates, and more."
/>

<main class="flex flex-col items-center">
	<h1 class="my-16 text-4xl font-bold">Articles</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each articles as article (article.slug)}
			<ArticlePill {article} />
			<ArticlePill {article} />
			<ArticlePill {article} />
			<ArticlePill {article} />
			<ArticlePill {article} />
		{/each}
	</div>
</main>

<pre>{JSON.stringify(data.defaultArticles, null, 2)}</pre>
