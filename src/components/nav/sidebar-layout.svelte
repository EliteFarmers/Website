<script lang="ts">
	import { page } from '$app/stores';
	import { ScrollArea } from '$ui/scroll-area';
	import { Button } from '$ui/button';
	import SidebarNav from '$comp/nav/sidebar-nav.svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';

	interface Props {
		title: string;
		navItems: { title: string; href: string; external?: boolean }[];
		children?: import('svelte').Snippet;
	}

	let { title, navItems, children }: Props = $props();

	let current = $derived(navItems.findIndex((p) => p.href.startsWith($page.url.pathname)));
	let previous = $derived(navItems[current - 1]);
	let next = $derived(navItems[current + 1]);
</script>

<div
	class="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10"
>
	<aside class="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
		<ScrollArea class="h-full py-6 pr-6 lg:py-8">
			<SidebarNav navItems={[{ title, items: navItems }]} />
		</ScrollArea>
	</aside>
	<div id="main" class="mx-auto w-full min-w-0">
		{@render children?.()}

		<div class="flex flex-row items-center justify-between">
			{#key $page.url.pathname}
				{#if previous}
					<Button
						href={previous.href}
						class="flex flex-row items-center gap-1 leading-none"
						variant="outline"
					>
						<ArrowLeft class="mt-0.5 h-4 w-4" />
						{previous.title}
					</Button>
				{:else}
					<div></div>
				{/if}
				{#if next}
					<Button href={next.href} class="flex flex-row items-center gap-1 leading-none" variant="outline">
						{next.title}
						<ArrowRight class="mt-0.5 h-4 w-4" />
					</Button>
				{/if}
			{/key}
		</div>
	</div>
</div>
