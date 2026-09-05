<script lang="ts">
	import Head from '$comp/seo/head.svelte';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		children,
		actions,
		overview = false,
	}: {
		title: string;
		description: string;
		children: Snippet;
		actions?: Snippet;
		overview?: boolean;
	} = $props();

	const pageCtx = getPageCtx();
	$effect.pre(() => {
		pageCtx.setBreadcrumbs(overview ? [{ name: 'Tools' }] : [{ name: 'Tools', href: '/tools' }, { name: title }]);
	});
</script>

<Head title="{title} | Elite" {description} />

<div class="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6 py-6 md:py-8">
	<header class="flex flex-wrap items-start justify-between gap-3">
		<div class="min-w-0 space-y-2">
			<h1 class="text-2xl md:text-3xl">{title}</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">{description}</p>
		</div>
		{#if actions}<div class="shrink-0">{@render actions()}</div>{/if}
	</header>
	{@render children()}
</div>
