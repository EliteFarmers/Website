<script lang="ts">
	import { resolve } from '$app/paths';
	import Footer from '$comp/footer/footer.svelte';
	import { Button } from '$ui/button';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="flex min-h-svh flex-col">
	<header class="border-border bg-background border-b">
		<div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
			<a href={resolve('/')} class="flex min-w-0 items-center gap-2.5 font-semibold tracking-tight">
				<img src="/favicon.webp" alt="" class="size-8 shrink-0" />
				<span class="truncate text-lg">Elite Skyblock</span>
			</a>

			<Button href={resolve('/')} variant="outline" class="shrink-0">
				<ArrowLeft />
				<span class="hidden sm:inline">Back to main site</span>
				<span class="sm:hidden">Main site</span>
			</Button>
		</div>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer />
</div>
